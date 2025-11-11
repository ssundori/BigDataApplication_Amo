INSERT INTO global_annual_temperatures (
	measurement_year,
	global_avg_temperature_celsius
) VALUES
(1950, 13.60), (1951, 13.74), (1952, 13.72), (1953, 13.80),
(1954, 13.60), (1955, 13.58), (1956, 13.52), (1957, 13.77),
(1958, 13.84), (1959, 13.80), (1960, 13.76), (1961, 13.83),
(1962, 13.77), (1963, 13.81), (1964, 13.60), (1965, 13.66),
(1966, 13.74), (1967, 13.75), (1968, 13.69), (1969, 13.82),
(1970, 13.80), (1971, 13.64), (1972, 13.78), (1973, 13.88),
(1974, 13.60), (1975, 13.63), (1976, 13.56), (1977, 13.85),
(1978, 13.79), (1979, 13.94), (1980, 14.07), (1981, 14.11),
(1982, 13.91), (1983, 14.10), (1984, 13.89), (1985, 13.85),
(1986, 13.94), (1987, 14.09), (1988, 14.12), (1989, 14.01),
(1990, 14.24), (1991, 14.18), (1992, 13.95), (1993, 14.00),
(1994, 14.03), (1995, 14.21), (1996, 14.08), (1997, 14.20),
(1998, 14.39), (1999, 14.12), (2000, 14.12), (2001, 14.28),
(2002, 14.38), (2003, 14.36), (2004, 14.30), (2005, 14.46),
(2006, 14.42), (2007, 14.41), (2008, 14.28), (2009, 14.41),
(2010, 14.50), (2011, 14.36), (2012, 14.41), (2013, 14.44),
(2014, 14.48), (2015, 14.63), (2016, 14.81), (2017, 14.72),
(2018, 14.64), (2019, 14.77), (2020, 14.80), (2021, 14.65),
(2022, 14.67), (2023, 14.97), (2024, 15.09), (2025, 15.24);


LOAD DATA INFILE 'E:/xampp/mysql/files/sea-surface-temperature-anomaly.csv'
INTO TABLE global_annual_sst_anomalies
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(@entity, @code, @year, @sst, @lower, @upper)
SET
  region_entity = @entity,
  measurement_year = CAST(@year AS SIGNED),
  sst_anomaly_celsius = CAST(@sst AS DECIMAL(5,3)),
  anomaly_lower_bound = CAST(@lower AS DECIMAL(5,3)),
  anomaly_upper_bound = CAST(@upper AS DECIMAL(5,3));




LOAD DATA INFILE 'E:/xampp/mysql/files/co2-long-term-concentration.csv'
INTO TABLE co2_concentration
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(@entity, @code, @year, @co2)
SET
  year = CAST(@year AS SIGNED),
  co2_ppm = CAST(@co2 AS DECIMAL(6,3));



