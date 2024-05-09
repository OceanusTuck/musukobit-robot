input.onButtonPressed(Button.A, function () {
    basic.showLeds(`
        . . # . .
        . . # . .
        # . # . #
        . # # # .
        . . # . .
        `)
    Musuko.all_motor_run(
    50,
    50,
    50,
    500
    )
    basic.pause(2000)
    basic.showLeds(`
        . . # . .
        . # # # .
        # . # . #
        . . # . .
        . . # . .
        `)
    Musuko.all_motor_run(
    -50,
    -50,
    -50,
    -50
    )
    basic.pause(2000)
    Musuko.motor_stop_all()
})
