# Lidar-Annotater
Code for viewing videos and adding annotations

- Requires npm and Node js installed
    > On Linux, enter command "install npm" to install npm (haventtried using on windows yet)
- Use command "npm start" (without quotes) inside the root folder to run the program
- Add directory selects where the program will print output too as well as where it will look for the videos
- Videos MUST be named "vidA.mp4" and "vidB.mp4"
- A single annotation consists of 4 fields: start time, end time, justification, and action

# Current Issues
- In the output file, the last character typed for each annotation (it doesn't matter which field it was typed in) is ommitted.
    > Currently, we think the problem is somewhere in "onSubmit"
