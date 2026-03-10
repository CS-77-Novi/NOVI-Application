-- Participant table
CREATE TABLE participant (
    participant_id BIGSERIAL PRIMARY KEY,
    participant_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- session_student table for group sessions
CREATE TABLE group_session (
    session_id BIGSERIAL PRIMARY KEY,
    participant_id TEXT NOT NULL,
    session_type VARCHAR(20) NOT NULL DEFAULT 'GROUP',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    total_duration INT, 
    attentive_duration INT,
    distraction_duration INT,
    average_attention_score DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

--attention_log table
CREATE TABLE attention_log (
    log_id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    participant_id BIGINT,
    time_stamp INT NOT NULL,
    attention_score DECIMAL(5,2) NOT NULL,

    FOREIGN KEY (session_id)
        REFERENCES study_session(session_id)
        ON DELETE CASCADE,

    FOREIGN KEY (participant_id)
        REFERENCES participant(participant_id)
        ON DELETE CASCADE
);