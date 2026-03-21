-- study_session table
CREATE TABLE study_session (
    session_id BIGSERIAL PRIMARY KEY,
    participant_id TEXT NOT NULL,
    session_type VARCHAR(20) NOT NULL DEFAULT 'INDIVIDUAL',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    total_duration INT, 
    attentive_duration INT,
    distraction_duration INT,
    average_attention_score DECIMAL(5,2),
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

--Report table
CREATE TABLE report (
    report_id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    file_name VARCHAR(150) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    generated_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (session_id)
        REFERENCES study_session(session_id)
        ON DELETE CASCADE
);