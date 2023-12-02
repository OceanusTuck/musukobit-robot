input.onButtonPressed(Button.A, function () {
    Musuko.RobotTrackLine(
    0,
    1,
    LineTrack.ALL_TYPE,
    100,
    50
    )
    Musuko.TurnToAngle(RobotDir.Front, 300, 100)
    Musuko.TurnToAngle(RobotDir.Right, 1600, 100)
})
