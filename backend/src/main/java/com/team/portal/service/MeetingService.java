package com.team.portal.service;

import com.team.portal.dto.request.CreateMeetingRequest;
import com.team.portal.dto.request.LogAttendanceRequest;
import com.team.portal.dto.request.UpdateMeetingNotesRequest;
import com.team.portal.dto.response.MeetingLogResponseDto;
import com.team.portal.dto.response.MeetingResponseDto;
import com.team.portal.dto.response.UserDto;
import com.team.portal.entity.Meeting;
import com.team.portal.entity.MeetingLog;
import com.team.portal.entity.User;
import com.team.portal.exception.ResourceNotFoundException;
import com.team.portal.repository.MeetingLogRepository;
import com.team.portal.repository.MeetingRepository;
import com.team.portal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingLogRepository meetingLogRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<MeetingResponseDto> getAllMeetings() {
        List<Meeting> meetings = meetingRepository.findAllWithCreator();
        return meetings.stream().map(this::mapToMeetingDto).collect(Collectors.toList());
    }

    @Transactional
    public MeetingResponseDto createMeeting(CreateMeetingRequest request) {
        User currentUser = authService.getCurrentUser();

        Meeting meeting = Meeting.builder()
                .title(request.getTitle().trim())
                .googleMeetLink(request.getGoogleMeetLink().trim())
                .startTime(request.getStartTime())
                .durationMinutes(request.getDurationMinutes())
                .takeNoteContent(request.getTakeNoteContent())
                .noteDocUrl(request.getNoteDocUrl())
                .createdBy(currentUser)
                .build();

        Meeting saved = meetingRepository.save(meeting);
        return mapToMeetingDto(saved);
    }

    @Transactional
    public MeetingResponseDto updateNotes(Long meetingId, UpdateMeetingNotesRequest request) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc họp với ID: " + meetingId));

        if (request.getTakeNoteContent() != null) {
            meeting.setTakeNoteContent(request.getTakeNoteContent());
        }
        if (request.getNoteDocUrl() != null) {
            meeting.setNoteDocUrl(request.getNoteDocUrl());
        }

        Meeting updated = meetingRepository.save(meeting);
        return mapToMeetingDto(updated);
    }

    @Transactional
    public MeetingLogResponseDto logAttendance(Long meetingId, LogAttendanceRequest request) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc họp với ID: " + meetingId));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên với ID: " + request.getUserId()));

        Optional<MeetingLog> existing = meetingLogRepository.findByMeetingIdAndUserId(meetingId, user.getId());
        MeetingLog logEntry;
        if (existing.isPresent()) {
            logEntry = existing.get();
            logEntry.setAttendanceStatus(request.getAttendanceStatus());
            logEntry.setLoggedMinutes(request.getLoggedMinutes());
            logEntry.setContributionNote(request.getContributionNote());
        } else {
            logEntry = MeetingLog.builder()
                    .meeting(meeting)
                    .user(user)
                    .attendanceStatus(request.getAttendanceStatus())
                    .loggedMinutes(request.getLoggedMinutes())
                    .contributionNote(request.getContributionNote())
                    .build();
        }

        MeetingLog saved = meetingLogRepository.save(logEntry);
        return MeetingLogResponseDto.builder()
                .id(saved.getId())
                .user(UserDto.fromEntity(saved.getUser()))
                .attendanceStatus(saved.getAttendanceStatus())
                .loggedMinutes(saved.getLoggedMinutes())
                .contributionNote(saved.getContributionNote())
                .build();
    }

    private MeetingResponseDto mapToMeetingDto(Meeting meeting) {
        List<MeetingLog> logs = meetingLogRepository.findByMeetingIdWithUser(meeting.getId());
        int totalMinutes = logs.stream().mapToInt(MeetingLog::getLoggedMinutes).sum();

        List<MeetingLogResponseDto> logDtos = logs.stream()
                .map(l -> MeetingLogResponseDto.builder()
                        .id(l.getId())
                        .user(UserDto.fromEntity(l.getUser()))
                        .attendanceStatus(l.getAttendanceStatus())
                        .loggedMinutes(l.getLoggedMinutes())
                        .contributionNote(l.getContributionNote())
                        .build())
                .collect(Collectors.toList());

        return MeetingResponseDto.builder()
                .id(meeting.getId())
                .title(meeting.getTitle())
                .googleMeetLink(meeting.getGoogleMeetLink())
                .startTime(meeting.getStartTime())
                .durationMinutes(meeting.getDurationMinutes())
                .takeNoteContent(meeting.getTakeNoteContent())
                .noteDocUrl(meeting.getNoteDocUrl())
                .createdBy(UserDto.fromEntity(meeting.getCreatedBy()))
                .logs(logDtos)
                .totalLoggedMinutes(totalMinutes)
                .build();
    }
}
