Make sure to have installed node and ffmpeg.
Script is based on node 14 and ffmpeg 4.4.1

CONFIG

- RTSP_LINK to connect to IP camera.
- SPACE_LIMIT in GB to set limit for archive. After limit is reached, portion of files in storage folder will be emplied to free up space.
- SPACE_CHECK_INTERVAL in minutes between checks of taken space for archive.
- SLICE_DURATION in seconds for recorded video slices.
- CONCAT_INTERVAL in minutes between merging slices into one piece and saving in storage.
