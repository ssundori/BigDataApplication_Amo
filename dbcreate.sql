-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS climate_disaster_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE climate_disaster_db;

-- 1. Continent (대륙)
CREATE TABLE continent (
  continent_id INT AUTO_INCREMENT PRIMARY KEY,
  continent_name VARCHAR(50) NOT NULL
);

-- 2. Country (국가)
CREATE TABLE country (
  country_id INT AUTO_INCREMENT PRIMARY KEY,
  country_name VARCHAR(100) NOT NULL,
  iso_code VARCHAR(10),
  continent_id INT,
  FOREIGN KEY (continent_id) REFERENCES continent(continent_id)
);

-- 3. Disaster_Types (재해 유형)
CREATE TABLE disaster_types (
  disaster_type_id INT AUTO_INCREMENT PRIMARY KEY,
  disaster_group VARCHAR(100),
  disaster_subgroup VARCHAR(100),
  disaster_type VARCHAR(100),
  disaster_subtype VARCHAR(100)
);

-- 4. Disasters (재해 상세)
CREATE TABLE disasters (
  disaster_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  disno VARCHAR(50) UNIQUE,
  country_id INT,
  disaster_type_id INT,
  start_year INT,
  end_year INT,
  total_deaths INT,
  total_affected BIGINT,
  total_damage_thousand_usd BIGINT,
  FOREIGN KEY (country_id) REFERENCES country(country_id),
  FOREIGN KEY (disaster_type_id) REFERENCES disaster_types(disaster_type_id)
);

-- 5. Country_Monthly_Temperatures (국가별 월평균 기온)
CREATE TABLE country_monthly_temperatures (
  record_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  country_id INT,
  measurement_year INT,
  measurement_month INT,
  avg_temperature_celsius DECIMAL(5,2),
  FOREIGN KEY (country_id) REFERENCES country(country_id)
);

-- 6. Global_Annual_Temperatures (전지구 연평균 기온)
CREATE TABLE global_annual_temperatures (
  record_id INT AUTO_INCREMENT PRIMARY KEY,
  measurement_year INT,
  global_avg_temperature_celsius DECIMAL(5,2)
);

-- 7. Global_Annual_SST_Anomalies (연평균 해수면 온도 이상값)
CREATE TABLE global_annual_sst_anomalies (
  record_id INT AUTO_INCREMENT PRIMARY KEY,
  region_entity VARCHAR(100),
  measurement_year INT,
  sst_anomaly_celsius DECIMAL(5,3),
  anomaly_lower_bound DECIMAL(5,3),
  anomaly_upper_bound DECIMAL(5,3)
);

-- 8. CO2_Concentration (CO₂ 농도)
CREATE TABLE co2_concentration (
  co2_id INT AUTO_INCREMENT PRIMARY KEY,
  year INT,
  co2_ppm DECIMAL(6,3)
);

-- 9. user_info (사용자)
CREATE TABLE user_info (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. user_insert (사용자 삽입 로그)
CREATE TABLE user_insert (
  insert_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  table_name VARCHAR(50),
  record_id INT,
  created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_info(user_id)
);
