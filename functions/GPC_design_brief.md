# GPC Database Design Brief

## Overview
Database design for storing and processing Giant Pumpkin Commonwealth (GPC) competition results across all categories, with support for both historical data migration and future data submissions.

## Categories
- Pumpkins (P)
- Squash (S)
- Long Gourds (L)
- Watermelon (W)
- Tomato (T)
- Field Pumpkins (F)
- Bushel Gourds (B)
- Marrows (M)

## Data Flow

### 1. Raw Data Layer
- Schema: `raw_data`
- Tables: `{category}_{year}` (e.g., `p_2024`, `s_2024`)
- Purpose: Direct mirror of bigpumpkins.com data structure
- Source: Scraped from URLs following pattern: `bigpumpkins.com/WeighoffResultsGPC.aspx?c={category}&y={year}`

### 2. Staging Layer
- Schema: `staging`
- Tables:
  - `entries_staging`
  - `growers_staging`
  - `sites_staging`
- Purpose: Cleaned and normalized data, ready for processing
- Processing: Data validation, deduplication, and standardization

### 3. Core Layer
- Schema: `core`
- Tables:
  - `categories`
  - `growers`
  - `sites`
  - `entries`
- Purpose: Normalized, relational data structure
- Features: Full history, relationships, and data integrity

### 4. Site Submission Layer
- Schema: `submissions`
- Tables: 
  - `site_entries_pending`
  - `site_entries_verified`
- Purpose: Handle new data submissions from site leaders
- Flow: Pending → Admin Verification → Core Layer

### 5. Analytics Layer
- Schema: `analytics`
- Views/Tables:
  - `rankings_{category}_{year}`
  - `grower_stats`
  - `site_stats`
- Purpose: Pre-calculated rankings and statistics

## Data Processing Stages

1. **Historical Data ETL**
   - Scrape → Raw Layer
   - Raw → Staging → Core
   - Core → Analytics

2. **New Data Submissions**
   - Site Upload → Submissions Layer
   - Admin Verification
   - Verified Data → Core Layer
   - Core → Analytics Update

## Data Relationships

### Primary Entities
- Growers (unique across all categories)
- Sites (unique across all categories)
- Entries (category-specific, linked to growers and sites)
- Categories (static reference table)

### Key Relationships
- Each entry belongs to one category
- Each entry belongs to one grower
- Each entry belongs to one site
- Each site can host multiple categories
- Each grower can compete in multiple categories

## Identity Management

### Grower Identification
- Challenge: Grower names vary across entries (spelling, formatting, moves)
- Solution: Two-tier identification system
  - System-generated unique ID (primary key)
  - Processed name field (standardized format)
  - Historical name variations tracked
  - Location history maintained

### Entry Uniqueness
- Challenge: Multiple entries could share weight/grower combination
- Solution: Composite natural key includes
  - Category
  - Year
  - Weight
  - Grower ID
  - Site ID
  - Entry date/time

### Data Matching Strategy
- Raw data processed through name standardization
- Fuzzy matching algorithms for historical data
- Manual review interface for uncertain matches
- Grower merge capability for duplicate resolution