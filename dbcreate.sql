-- 데이터베이스 생성
DROP DATABASE IF EXISTS climate_disaster_db;
CREATE DATABASE IF NOT EXISTS climate_disaster_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE climate_disaster_db;

-- Continent (대륙)
CREATE TABLE continent (
  continent_id INT AUTO_INCREMENT PRIMARY KEY,        -- 대륙 PK
  continent_name VARCHAR(50) NOT NULL UNIQUE          -- 대륙명 (중복 방지 + 인덱스 자동)
) ENGINE=InnoDB;

-- Country (국가)
CREATE TABLE country (
  country_id INT AUTO_INCREMENT PRIMARY KEY,          -- 국가 PK
  country_name VARCHAR(100) NOT NULL UNIQUE,          -- 국가명 (중복 방지 + 인덱스 자동)
  iso_code VARCHAR(10),                               -- ISO 코드
  continent_id INT,                                   -- 소속 대륙 FK
  FOREIGN KEY (continent_id) REFERENCES continent(continent_id)
    ON UPDATE CASCADE ON DELETE SET NULL              -- 대륙 삭제 시 NULL
) ENGINE=InnoDB;

-- Disaster_Types (재해 유형)
CREATE TABLE disaster_types (
  disaster_type_id INT AUTO_INCREMENT PRIMARY KEY,    -- 재해유형 PK
  disaster_group VARCHAR(100),                        -- 상위 그룹
  disaster_subgroup VARCHAR(100),                     -- 하위 그룹
  disaster_type VARCHAR(100),                         -- 유형
  disaster_subtype VARCHAR(100)                       -- 세부 유형
) ENGINE=InnoDB;

-- Disasters (재해 상세)
CREATE TABLE disasters (
  disaster_id BIGINT AUTO_INCREMENT PRIMARY KEY,      -- 재해 사건 PK
  disno VARCHAR(50) UNIQUE,                           -- 외부 식별자 (중복 방지 + 인덱스 자동)
  country_id INT,                                     -- 발생 국가 FK
  disaster_type_id INT,                               -- 재해 유형 FK
  start_year INT,                                     -- 시작 연도
  end_year INT,                                       -- 종료 연도
  total_deaths INT,                                   -- 총 사망자수
  total_affected BIGINT,                              -- 총 피해자수
  total_damage_thousand_usd BIGINT,                   -- 피해액 (천 달러 단위)
  FOREIGN KEY (country_id) REFERENCES country(country_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (disaster_type_id) REFERENCES disaster_types(disaster_type_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_disasters_type_year (disaster_type_id, start_year) --  연도,재해타입별 ROLLUP/RANKING 최적화
) ENGINE=InnoDB;

-- Country_Annual_Temperatures (국가별 연평균 기온)
CREATE TABLE country_annual_temperatures (
  record_id BIGINT AUTO_INCREMENT PRIMARY KEY,        -- 레코드 PK
  country_id INT,                                     -- 국가 FK
  measurement_year INT,                               -- 측정 연도
  avg_temperature_celsius DECIMAL(5,2),               -- 연평균 기온
  FOREIGN KEY (country_id) REFERENCES country(country_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  UNIQUE (country_id, measurement_year),              -- (국가, 연도) 중복 방지 + 자동 인덱스
  INDEX (measurement_year)                            -- 연도별 ROLLUP/집계 최적화
) ENGINE=InnoDB;

-- Global_Annual_Temperatures (전지구 연평균 기온)
CREATE TABLE global_annual_temperatures (
  record_id INT AUTO_INCREMENT PRIMARY KEY,           -- PK
  measurement_year INT UNIQUE,                        -- 연도 (UNIQUE = 자동 인덱스)
  global_avg_temperature_celsius DECIMAL(5,2)         -- 전지구 평균 기온
) ENGINE=InnoDB;

-- 7Global_Annual_SST_Anomalies (연평균 해수면 온도 이상값)
CREATE TABLE global_annual_sst_anomalies (
  record_id INT AUTO_INCREMENT PRIMARY KEY,           -- PK
  region_entity VARCHAR(100),                         -- 지역명 (전체, 북반구, 남반구)
  measurement_year INT,                               -- 연도
  sst_anomaly_celsius DECIMAL(5,3),                   -- 해수면 온도 이상값
  anomaly_lower_bound DECIMAL(5,3),                   -- 신뢰구간 하한
  anomaly_upper_bound DECIMAL(5,3),                   -- 신뢰구간 상한
  UNIQUE (region_entity, measurement_year),            -- 지역+연도 조합 중복 방지
  INDEX (measurement_year)                            -- 연도별 윈도잉 최적화
) ENGINE=InnoDB;

-- CO2_Concentration (CO₂ 농도)
CREATE TABLE co2_concentration (
  co2_id INT AUTO_INCREMENT PRIMARY KEY,              -- PK
  year INT UNIQUE,                                    -- 연도 (UNIQUE = 자동 인덱스)
  co2_ppm DECIMAL(6,3)                                -- CO₂ 농도(ppm)
) ENGINE=InnoDB;

-- User_Info (사용자 정보)
CREATE TABLE user_info (
  user_id INT AUTO_INCREMENT PRIMARY KEY,             -- 내부 고유 ID
  user_login_id VARCHAR(50) UNIQUE NOT NULL,          -- 로그인 ID (UNIQUE = 자동 인덱스)
  user_name VARCHAR(100) NOT NULL,                    -- 사용자 이름
  password VARCHAR(255) NOT NULL,                     -- 암호화된 비밀번호
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP      -- 생성 시간
) ENGINE=InnoDB;

-- User_Insert (사용자 삽입 로그)
CREATE TABLE user_insert (
  insert_id INT AUTO_INCREMENT PRIMARY KEY,           -- 로그 PK
  user_id INT,                                        -- 유저 FK
  table_name VARCHAR(50),                             -- 삽입된 테이블명
  record_id INT,                                      -- 삽입된 레코드 ID
  created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   -- 삽입 시간
  FOREIGN KEY (user_id) REFERENCES user_info(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE               -- 유저 삭제 시 로그도 삭제
) ENGINE=InnoDB;


