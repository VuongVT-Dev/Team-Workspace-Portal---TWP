package com.team.portal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

@Service
@Slf4j
public class StorageService {

    private final Path rootLocation;
    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;
    private final String baseFolder;
    private final boolean cloudinaryEnabled;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public StorageService(
            @Value("${app.upload.dir:./uploads}") String uploadDir,
            @Value("${app.cloudinary.cloud-name:}") String cloudName,
            @Value("${app.cloudinary.api-key:}") String apiKey,
            @Value("${app.cloudinary.api-secret:}") String apiSecret,
            @Value("${app.cloudinary.folder:twp-portal}") String baseFolder,
            ObjectMapper objectMapper) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.cloudName = cloudName != null ? cloudName.trim() : "";
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.apiSecret = apiSecret != null ? apiSecret.trim() : "";
        this.baseFolder = (baseFolder != null && !baseFolder.isBlank()) ? baseFolder.trim() : "twp-portal";
        this.cloudinaryEnabled = !this.cloudName.isEmpty() && !this.apiKey.isEmpty() && !this.apiSecret.isEmpty();
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();

        if (this.cloudinaryEnabled) {
            log.info("Cloudinary storage ENABLED (cloud='{}', folder='{}')", this.cloudName, this.baseFolder);
        } else {
            try {
                Files.createDirectories(this.rootLocation);
                log.info("Cloudinary not configured — using local disk storage at: {}", this.rootLocation);
            } catch (IOException e) {
                log.error("Could not initialize storage directory", e);
                throw new RuntimeException("Could not create upload directory!", e);
            }
        }
    }

    public String store(MultipartFile file) {
        return store(file, "general");
    }

    public String store(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Không thể tải lên tập tin rỗng.");
        }
        if (cloudinaryEnabled) {
            return storeToCloudinary(file, subFolder);
        }
        return storeLocally(file);
    }

    private String storeToCloudinary(MultipartFile file, String subFolder) {
        try {
            String originalFilename = StringUtils.cleanPath(
                    file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
            String contentType = file.getContentType() != null ? file.getContentType().toLowerCase() : "";
            boolean isImage = contentType.startsWith("image/") && !contentType.equals("image/svg+xml");
            String resourceType = isImage ? "image" : "raw";

            String cleanSub = (subFolder != null && !subFolder.isBlank())
                    ? subFolder.replaceAll("[^a-zA-Z0-9/_-]", "")
                    : "general";
            String folder = baseFolder + "/" + cleanSub;

            String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            String publicId;
            if (isImage) {
                publicId = uuid;
            } else {
                // Keep extension on raw files so browser/OS recognizes PDF, DOCX, PPTX, ZIP cleanly
                String safeName = originalFilename
                        .replaceAll("\\s+", "_")
                        .replaceAll("[^a-zA-Z0-9._-]", "");
                if (safeName.isBlank()) {
                    safeName = "file";
                }
                if (safeName.length() > 80) {
                    int dot = safeName.lastIndexOf('.');
                    String ext = dot > 0 ? safeName.substring(dot) : "";
                    safeName = safeName.substring(0, Math.max(1, 80 - ext.length())) + ext;
                }
                publicId = uuid + "_" + safeName;
            }

            String timestamp = String.valueOf(Instant.now().getEpochSecond());

            // Cloudinary requires signed params sorted alphabetically by key
            TreeMap<String, String> signedParams = new TreeMap<>();
            signedParams.put("folder", folder);
            signedParams.put("public_id", publicId);
            signedParams.put("timestamp", timestamp);

            String signature = signCloudinaryParams(signedParams, apiSecret);

            String boundary = "----TWPCldBoundary" + UUID.randomUUID().toString().replace("-", "");
            byte[] body = buildMultipartBody(
                    boundary,
                    Map.of(
                            "api_key", apiKey,
                            "folder", folder,
                            "public_id", publicId,
                            "timestamp", timestamp,
                            "signature", signature
                    ),
                    originalFilename,
                    contentType.isEmpty() ? "application/octet-stream" : contentType,
                    file.getBytes()
            );

            String uploadUrl = String.format("https://api.cloudinary.com/v1_1/%s/%s/upload", cloudName, resourceType);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(uploadUrl))
                    .timeout(Duration.ofSeconds(60))
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode json = objectMapper.readTree(response.body());

            if (response.statusCode() >= 400) {
                String errMsg = json.path("error").path("message").asText(response.body());
                log.error("Cloudinary upload failed (HTTP {}): {}", response.statusCode(), errMsg);
                throw new RuntimeException("Lỗi tải file lên Cloudinary: " + errMsg);
            }

            String secureUrl = json.path("secure_url").asText("");
            if (secureUrl.isBlank()) {
                throw new RuntimeException("Cloudinary không trả về secure_url.");
            }
            log.info("Uploaded file '{}' to Cloudinary ({}): {}", originalFilename, resourceType, secureUrl);
            return secureUrl;
        } catch (IOException e) {
            throw new RuntimeException("Không thể đọc dữ liệu file để upload lên Cloudinary: " + e.getMessage(), e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Quá trình upload lên Cloudinary bị gián đoạn.", e);
        }
    }

    private String storeLocally(MultipartFile file) {
        try {
            Files.createDirectories(this.rootLocation);
            String originalFilename = StringUtils.cleanPath(
                    file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
            String extension = "";
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex > 0) {
                extension = originalFilename.substring(dotIndex);
            }

            String uniqueFilename = UUID.randomUUID() + extension;
            Path destinationFile = this.rootLocation.resolve(uniqueFilename).normalize();

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            return "/uploads/" + uniqueFilename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    public Path load(String filename) {
        return rootLocation.resolve(filename).normalize();
    }

    private static String signCloudinaryParams(TreeMap<String, String> params, String secret) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (sb.length() > 0) {
                sb.append('&');
            }
            sb.append(entry.getKey()).append('=').append(entry.getValue());
        }
        sb.append(secret);

        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] digest = md.digest(sb.toString().getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte b : digest) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-1 algorithm unavailable", e);
        }
    }

    private static byte[] buildMultipartBody(
            String boundary,
            Map<String, String> fields,
            String filename,
            String contentType,
            byte[] fileBytes) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        String lineBreak = "\r\n";

        for (Map.Entry<String, String> entry : fields.entrySet()) {
            out.write(("--" + boundary + lineBreak).getBytes(StandardCharsets.UTF_8));
            out.write(("Content-Disposition: form-data; name=\"" + entry.getKey() + "\"" + lineBreak + lineBreak)
                    .getBytes(StandardCharsets.UTF_8));
            out.write((entry.getValue() + lineBreak).getBytes(StandardCharsets.UTF_8));
        }

        String safeHeaderFilename = filename.replace("\"", "_");
        out.write(("--" + boundary + lineBreak).getBytes(StandardCharsets.UTF_8));
        out.write(("Content-Disposition: form-data; name=\"file\"; filename=\"" + safeHeaderFilename + "\"" + lineBreak)
                .getBytes(StandardCharsets.UTF_8));
        out.write(("Content-Type: " + contentType + lineBreak + lineBreak).getBytes(StandardCharsets.UTF_8));
        out.write(fileBytes);
        out.write((lineBreak + "--" + boundary + "--" + lineBreak).getBytes(StandardCharsets.UTF_8));

        return out.toByteArray();
    }
}
