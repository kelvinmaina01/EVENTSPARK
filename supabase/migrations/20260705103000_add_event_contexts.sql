-- Add category, city, and video_url to events table
ALTER TABLE events
ADD COLUMN category text,
ADD COLUMN city text,
ADD COLUMN video_url text;
