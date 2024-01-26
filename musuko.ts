/**
* Musuko blocks
*/

enum Motor_Ch {
    //% block="M1"
    M1 = 0,
    //% block="M2"
    M2 = 1,
    //% block="M3"
    M3 = 2,
    //% block="M4"
    M4 = 3
}

enum Motor_Dir {
    //% block="CW"
    CW = 0,
    //% block="CCW"
    CCW = 1
}

enum Servo_Ch {
    //% block="S0"
    S0 = 0,
    //% block="S1"
    S1 = 1,
    //% block="S2"
    S2 = 2,
    //% block="S3"
    S3 = 3,
    //% block="S4"
    S4 = 4,
    //% block="S5"
    S5 = 5
}

enum ADC_Ch {
    //% block="ADC1"
    ADC1 = 0,
    //% block="ADC2"
    ADC2 = 1,
    //% block="ADC3"
    ADC3 = 2,
    //% block="ADC4"
    ADC4 = 3
}

enum DI_Ch {
    //% block="DI1"
    DI1 = 0,
    //% block="DI2"
    DI2 = 1,
    //% block="DI3"
    DI3 = 2,
    //% block="DI4"
    DI4 = 3
}

enum LineTrack {
    //% block="None"
    NONE = 0,
    //% block="Left turn"
    TURN_LEFT = 1,
    //% block="Right turn"
    TURN_RIGHT = 2,
    //% block="Cross way"
    CROSS_WAY = 3,
    //% block="All"
    ALL_TYPE = 4,
}

enum RobotDir {
    //% block="Front"
    Front = 0,
    //% block="Left"
    Left = 1,
    //% block="Right"
    Right = 2,
    //% block="Back"
    Back = 3,
}

//--------------------------------------------------------------------------
//% weight=11 color=#AF7AC5 icon="\uf085" block="MUSUKO:BIT"
//% groups=['Headlights', 'DC Motors', 'Maker Line', 'Ultrasonic']
namespace Musuko {

    // Extension board I2C address
    const EXT_BOARD_ADDR = 132

    // I2C Command
    const SET_MOTOR_CMD = 0         // cmd, motor ch 0-3, value
    const SET_ALL_MOTOR_CMD = 1         // cmd, m1, m2, m3, m4

    const UART1_WR_CMD = 2         // cmd, buffer
    const UART2_WR_CMD = 3         // cmd, buffer
    const UART1_RD_CMD = 4         // cmd, rx buffer
    const UART2_RD_CMD = 5         // cmd, rx buffer
    const UART1_BUF_SIZE_CMD = 6     	// cmd, rx available size
    const UART2_BUF_SIZE_CMD = 7     	// cmd, rx available size
    const SET_UART1_SPEED = 8    	    // cmd, baudrate (uint16)
    const SET_UART2_SPEED = 9		    // cmd, baudrate (uint16)
    const SET_SERVO_CMD = 10        // cmd, ch 0-5, value (uint16)
    const SET_ALL_SERVO_CMD = 11    	// cmd, ch0, ch1, ..., ch5

    const READ_ADC_CMD = 12        // cmd
    const READ_DI_CMD = 13        // cmd

    /* robot command */
    const ROBOT_TRACK_LINE = 50    // cmd, speed max, speed min
    const ROBOT_SET_TRACK_FILLTER = 51    // Robot line tracking filter time (ms)
    const READ_ROBOT_STATE = 52    // Read robot command state
    const SET_MOTOR_RATE = 53    // cmd, m1, m2, m3, m4 (0-100)

    // Extension board IO, ADC value
    let ADC1 = 0
    let ADC2 = 0
    let ADC3 = 0
    let ADC4 = 0

    let DI1 = 0
    let DI2 = 0
    let DI3 = 0
    let DI4 = 0

    //----------------------------------------------------------------------
    // Helper function
    //----------------------------------------------------------------------
    function limit(value: number, min: number, max: number) {
        if (value > max) { value = max }
        else if (value < min) { value = min }

        return value
    }

    //----------------------------------------------------------------------
    // Robot basic
    //----------------------------------------------------------------------
    //% group="Robot basic"
    //% weight=200
    //% blockGap=8
    //% block="Go to turn %turn"
    export function GoToTurn(turn: number): void {
        if (turn > 0)
        {
            RobotTrackLine(0, turn - 1, LineTrack.ALL_TYPE, 100, 50)
        }
    }

    /**
     * Turn robot to left run time in ms.
     * @param time_turn time int ms. eg: 800
     * @param time_fw time int ms. eg: 180
     */
    //% group="Robot basic"
    //% weight=199
    //% blockGap=8
    //% block="Turn left %time_turn %time_fw"
    export function Turn_left(time_turn = 800, time_fw = 180) {
        Musuko.TurnToAngle(RobotDir.Front, time_fw, 100)
        Musuko.TurnToAngle(RobotDir.Left, time_turn, 100)
    }

    /**
     * Turn robot to right run time in ms.
     * @param time_turn time int ms. eg: 800
     * @param time_fw time int ms. eg: 180
     */
    //% group="Robot basic"
    //% weight=198
    //% blockGap=8
    //% block="Turn right %time_turn %time_fw"
    export function Turn_right(time_turn = 800, time_fw = 180) {
        Musuko.TurnToAngle(RobotDir.Front, time_fw, 100)
        Musuko.TurnToAngle(RobotDir.Right, time_turn, 100)
    }

    /**
     * Turn robot to back run time in ms.
     * @param time_turn time int ms. eg: 800
     * @param time_fw time int ms. eg: 180
     */
    //% group="Robot basic"
    //% weight=197
    //% blockGap=40
    //% block="Turn back %time_turn %time_fw"
    export function Turn_back(time_turn = 1600, time_fw = 180) {
        Musuko.TurnToAngle(RobotDir.Front, time_fw, 100)
        Musuko.TurnToAngle(RobotDir.Left, time_turn, 100)
    }

    //----------------------------------------------------------------------
    // Robot
    //----------------------------------------------------------------------
    //% group="Robot"
    //% weight=100
    //% blockGap=8
    //% block="Track line time out %time turn skip %skip stop by %stop_mode speed high %speed_fast speed low %speed_slow"
    export function RobotTrackLine(time: number, skip: number, stop_mode: LineTrack, speed_fast: number, speed_slow: number): void {

        const buffer = pins.createBuffer(7)
        buffer.setNumber(NumberFormat.Int8LE, 0, ROBOT_TRACK_LINE)
        buffer.setNumber(NumberFormat.UInt16LE, 1, time)
        buffer.setNumber(NumberFormat.UInt8LE, 3, skip)
        buffer.setNumber(NumberFormat.UInt8LE, 4, stop_mode)
        buffer.setNumber(NumberFormat.UInt8LE, 5, speed_fast)
        buffer.setNumber(NumberFormat.UInt8LE, 6, speed_slow)
        pins.i2cWriteBuffer(EXT_BOARD_ADDR, buffer, false)

        // Wait for robot start work
        let timeout = 0
        while (IsRobotWorking() == true && timeout < 10) {
            timeout++
            basic.pause(20)
        }

        basic.pause(50)
        WaitRobotWorkDone()
    }

    //% group="Robot"
    //% weight=99
    //% blockGap=8
    //% block="Run to %dir time %time speed : %speed"
    export function TurnToAngle(dir: RobotDir, time: number, speed: number): void {

        if (dir == RobotDir.Front) { all_motor_run(speed, speed, speed, speed) }
        else if (dir == RobotDir.Left) { all_motor_run(speed, speed, -speed, -speed) }
        else if (dir == RobotDir.Right) { all_motor_run(-speed, -speed, speed, speed) }
        else if (dir == RobotDir.Back) { all_motor_run(-speed, -speed, -speed, -speed) }

        basic.pause(time)
        motor_stop_all()
    }

    //% group="Robot"
    //% weight=98
    //% blockGap=8
    //% block="Track line filter : time %time"
    export function RobotSensorFilter(time: number): void {

        const buffer = pins.createBuffer(3)
        buffer.setNumber(NumberFormat.Int8LE, 0, ROBOT_SET_TRACK_FILLTER)
        buffer.setNumber(NumberFormat.UInt16LE, 1, time)
        pins.i2cWriteBuffer(EXT_BOARD_ADDR, buffer, false)
    }

    //% group="Robot"
    //% weight=97
    //% blockGap=8
    //% block="Is robot work done"
    export function IsRobotWorking() {
        const buffer = pins.createBuffer(1)
        buffer.setNumber(NumberFormat.Int8LE, 0, READ_ROBOT_STATE)
        pins.i2cWriteBuffer(EXT_BOARD_ADDR, buffer, false)

        let di = pins.i2cReadBuffer(EXT_BOARD_ADDR, 2, false)

        if (di.length > 0) {
            let state1 = di.getNumber(NumberFormat.UInt8LE, 0)
            let state2 = di.getNumber(NumberFormat.UInt8LE, 1)

            if (state1 == 0 && state2 == 0xaa) { return true }
        }

        return false
    }

    //% group="Robot"
    //% weight=96
    //% blockGap=8
    //% block="Wait robot work done"
    export function WaitRobotWorkDone() {
        while (!(Musuko.IsRobotWorking())) {
            basic.pause(20)
        }
    }

    //% group="Robot"
    //% weight=95
    //% blockGap=40
    //% block="Calibrate motor 0-100 : M1 %m1 M2 %m2 M3 %m3 M4 %m4"
    export function CalibrateMotor(m1: number, m2: number, m3: number, m4: number): void {

        const buffer = pins.createBuffer(5)
        buffer.setNumber(NumberFormat.Int8LE, 0, SET_MOTOR_RATE)
        buffer.setNumber(NumberFormat.UInt8LE, 1, m1)
        buffer.setNumber(NumberFormat.UInt8LE, 2, m2)
        buffer.setNumber(NumberFormat.UInt8LE, 3, m3)
        buffer.setNumber(NumberFormat.UInt8LE, 4, m4)
        pins.i2cWriteBuffer(EXT_BOARD_ADDR, buffer, false)
    }

    //----------------------------------------------------------------------
    // Digital input
    //----------------------------------------------------------------------
    //% group="Digital input"
    //% weight=90
    //% blockGap=8
    //% block="Update digital input"
    export function update_di() {
        const buffer = pins.createBuffer(1)
        buffer.setNumber(NumberFormat.Int8LE, 0, READ_DI_CMD)
        pins.i2cWriteBuffer(EXT_BOARD_ADDR, buffer, false)

        let di = pins.i2cReadBuffer(EXT_BOARD_ADDR, 4, false)

        DI1 = di.getNumber(NumberFormat.Int8LE, 0)
        DI2 = di.getNumber(NumberFormat.Int8LE, 1)
        DI3 = di.getNumber(NumberFormat.Int8LE, 2)
        DI4 = di.getNumber(NumberFormat.Int8LE, 3)
    }

    //% group="Digital input"
    //% weight=89
    //% blockGap=40
    //% block="Digital input %ch"
    export function read_di(ch: DI_Ch) {
        switch (ch) {
            case DI_Ch.DI1:
                return DI1
                break

            case DI_Ch.DI2:
                return DI2
                break

            case DI_Ch.DI3:
                return DI3
                break

            case DI_Ch.DI4:
                return DI4
                break
        }

        return 0
    }

    //----------------------------------------------------------------------
    // ADC
    //----------------------------------------------------------------------
    //% group="Analog input"
    //% weight=80
    //% blockGap=8
    //% block="Update analog input"
    export function update_adc() {
        const buffer = pins.createBuffer(1)
        buffer.setNumber(NumberFormat.Int8LE, 0, READ_ADC_CMD)
        pins.i2cWriteBuffer(EXT_BOARD_ADDR, buffer, false)

        let adc = pins.i2cReadBuffer(EXT_BOARD_ADDR, 8, false)

        ADC1 = adc.getNumber(NumberFormat.UInt16LE, 0)
        ADC2 = adc.getNumber(NumberFormat.UInt16LE, 2)
        ADC3 = adc.getNumber(NumberFormat.UInt16LE, 4)
        ADC4 = adc.getNumber(NumberFormat.UInt16LE, 6)
    }

    //% group="Analog input"
    //% weight=79
    //% blockGap=40
    //% block="ADC value %ch"
    export function read_adc(ch: ADC_Ch) {
        switch (ch) {
            case ADC_Ch.ADC1:
                return ADC1
                break

            case ADC_Ch.ADC2:
                return ADC2
                break

            case ADC_Ch.ADC3:
                return ADC3
                break

            case ADC_Ch.ADC4:
                return ADC4
                break
        }

        return 0
    }

    //----------------------------------------------------------------------
    // Servo
    //----------------------------------------------------------------------
    //% group="Servo driver"
    //% weight=70
    //% blockGap=8
    //% block="Set all servo(us)\n S0:%s0 S1:%s1 S2:%s2 S3:%s3 S4:%s4 S5:%s5"
    export function all_servo_run(s0: number, s1: number, s2: number, s3: number, s4: number, s5: number): void {
        s0 = limit(s0, 0, 20000)
        s1 = limit(s1, 0, 20000)
        s2 = limit(s2, 0, 20000)
        s3 = limit(s3, 0, 20000)
        s4 = limit(s4, 0, 20000)
        s5 = limit(s5, 0, 20000)

        const buffer = pins.createBuffer(13)
        buffer.setNumber(NumberFormat.Int8LE, 0, SET_ALL_SERVO_CMD)
        buffer.setNumber(NumberFormat.UInt16LE, 1, s0)
        buffer.setNumber(NumberFormat.UInt16LE, 3, s1)
        buffer.setNumber(NumberFormat.UInt16LE, 5, s2)
        buffer.setNumber(NumberFormat.UInt16LE, 7, s3)
        buffer.setNumber(NumberFormat.UInt16LE, 9, s4)
        buffer.setNumber(NumberFormat.UInt16LE, 11, s5)
        pins.i2cWriteBuffer(EXT_BOARD_ADDR, buffer, false)
    }

    //% group="Servo driver"
    //% weight=69
    //% blockGap=40
    //% block="Set servo %ch to %val us"
    export function Set_servo(ch: Servo_Ch, val: number): void {

        val = limit(val, 0, 20000)

        const buffer = pins.createBuffer(4)
        buffer.setNumber(NumberFormat.Int8LE, 0, SET_SERVO_CMD)
        buffer.setNumber(NumberFormat.Int8LE, 1, ch)
        buffer.setNumber(NumberFormat.UInt16LE, 2, val)
        pins.i2cWriteBuffer(EXT_BOARD_ADDR, buffer, false)
    }

    //----------------------------------------------------------------------
    // Motor
    //----------------------------------------------------------------------
    //% group="Motor driver"
    //% weight=60
    //% blockGap=8
    //% block="Set motor speed(-100 to 100)\n M1:%speed_m1 M2:%speed_m2 M3:%speed_m3 M4:%speed_m4"
    export function all_motor_run(speed_m1: number, speed_m2: number, speed_m3: number, speed_m4: number): void {

        speed_m1 = limit(speed_m1, -100, 100)
        speed_m2 = limit(speed_m2, -100, 100)
        speed_m3 = limit(speed_m3, -100, 100)
        speed_m4 = limit(speed_m4, -100, 100)

        let pwm1_reg = speed_m1 + 128
        let pwm2_reg = speed_m2 + 128
        let pwm3_reg = speed_m3 + 128
        let pwm4_reg = speed_m4 + 128

        const buffer = pins.createBuffer(5)
        buffer.setNumber(NumberFormat.Int8LE, 0, SET_ALL_MOTOR_CMD)
        buffer.setNumber(NumberFormat.Int8LE, 1, pwm1_reg)
        buffer.setNumber(NumberFormat.Int8LE, 2, pwm2_reg)
        buffer.setNumber(NumberFormat.Int8LE, 3, pwm3_reg)
        buffer.setNumber(NumberFormat.Int8LE, 4, pwm4_reg)
        pins.i2cWriteBuffer(EXT_BOARD_ADDR, buffer, false)
    }

    //% group="Motor driver"
    //% weight=59
    //% blockGap=8
    //% block="Set motor %ch run to %dir speed %speed"
    export function motor_run(ch: Motor_Ch, dir: Motor_Dir, speed: number): void {

        speed = limit(speed, 0, 100)

        let pwm_val = speed
        if (dir == Motor_Dir.CCW) { pwm_val = -pwm_val }
        let motor_reg = pwm_val + 128

        const buffer = pins.createBuffer(3)
        buffer.setNumber(NumberFormat.Int8LE, 0, SET_MOTOR_CMD)
        buffer.setNumber(NumberFormat.Int8LE, 1, ch)
        buffer.setNumber(NumberFormat.Int8LE, 2, motor_reg)
        pins.i2cWriteBuffer(EXT_BOARD_ADDR, buffer, false)
    }

    /**
     * Stop motor
     */
    //% group="Motor driver"
    //% weight=58
    //% blockGap=8
    //% block="Set motor %ch break"
    export function motor_break(ch: Motor_Ch): void {
        motor_run(ch, Motor_Dir.CCW, 0)
    }

    /**
     * Stop motor
     */
    //% group="Motor driver"
    //% weight=57
    //% blockGap=40
    //% block="Stop all motor"
    export function motor_stop_all(): void {
        motor_run(Motor_Ch.M1, Motor_Dir.CCW, 0)
        motor_run(Motor_Ch.M2, Motor_Dir.CCW, 0)
        motor_run(Motor_Ch.M3, Motor_Dir.CCW, 0)
        motor_run(Motor_Ch.M4, Motor_Dir.CCW, 0)
    }

    //----------------------------------------------------------------------
    // UART
    //----------------------------------------------------------------------
    //% group="UART"
    //% weight=50
    //% blockGap=8
    //% block="write byte %val to uart1"
    export function uart1_write_byte(val: number): void {
        const buffer = pins.createBuffer(2)
        buffer.setNumber(NumberFormat.Int8LE, 0, UART1_WR_CMD)
        buffer.setNumber(NumberFormat.Int8LE, 1, val)
        pins.i2cWriteBuffer(EXT_BOARD_ADDR, buffer, false)
    }

    //% group="UART"
    //% weight=49
    //% blockGap=8
    //% block="write byte %val to uart2"
    export function uart2_write_byte(val: number): void {
        const buffer = pins.createBuffer(2)
        buffer.setNumber(NumberFormat.Int8LE, 0, UART2_WR_CMD)
        buffer.setNumber(NumberFormat.Int8LE, 1, val)
        pins.i2cWriteBuffer(EXT_BOARD_ADDR, buffer, false)
    }

    //% group="UART"
    //% weight=48
    //% blockGap=8
    //% block="write buffer %val to uart1"
    export function uart1_write_buffer(val: Buffer): void {
        const buffer = pins.createBuffer(val.length + 1)
        buffer.setNumber(NumberFormat.Int8LE, 0, UART1_WR_CMD)

        for (let i = 0; i < val.length; i++) { buffer.setNumber(NumberFormat.Int8LE, (i + 1), val[i]) }

        pins.i2cWriteBuffer(EXT_BOARD_ADDR, buffer, false)
    }

    //% group="UART"
    //% weight=47
    //% blockGap=8
    //% block="write buffer %val to uart2"
    export function uart2_write_buffer(val: Buffer): void {
        const buffer = pins.createBuffer(val.length + 1)
        buffer.setNumber(NumberFormat.Int8LE, 0, UART2_WR_CMD)

        for (let i = 0; i < val.length; i++) { buffer.setNumber(NumberFormat.Int8LE, (i + 1), val[i]) }

        pins.i2cWriteBuffer(EXT_BOARD_ADDR, buffer, false)
    }

    //% group="UART"
    //% weight=46
    //% blockGap=8
    //% block="write string %val to uart1"
    export function uart1_write_string(val: string): void {
        const addr = pins.createBuffer(1)
        addr.setNumber(NumberFormat.Int8LE, 0, UART1_WR_CMD)
        const msg = Buffer.fromUTF8(val)

        let arr = [addr, msg]
        let buffer = Buffer.concat(arr)

        pins.i2cWriteBuffer(EXT_BOARD_ADDR, buffer, false)
    }

    //% group="UART"
    //% weight=45
    //% blockGap=8
    //% block="write string %val to uart2"
    export function uart2_write_string(val: string): void {
        const addr = pins.createBuffer(1)
        addr.setNumber(NumberFormat.Int8LE, 0, UART2_WR_CMD)
        const msg = Buffer.fromUTF8(val)

        let arr = [addr, msg]
        let buffer = Buffer.concat(arr)

        pins.i2cWriteBuffer(EXT_BOARD_ADDR, buffer, false)
    }

    //% group="UART"
    //% weight=44
    //% blockGap=8
    //% block="write line %val to uart1"
    export function uart1_write_line(val: string): void {
        const addr = pins.createBuffer(1)
        addr.setNumber(NumberFormat.Int8LE, 0, UART1_WR_CMD)
        const msg = Buffer.fromUTF8(val)
        const lf = pins.createBuffer(1)
        lf.setNumber(NumberFormat.Int8LE, 0, 10)

        let arr = [addr, msg, lf]
        let buffer = Buffer.concat(arr)

        pins.i2cWriteBuffer(EXT_BOARD_ADDR, buffer, false)
    }

    //% group="UART"
    //% weight=43
    //% blockGap=8
    //% block="write line %val to uart2"
    export function uart2_write_line(val: string): void {
        const addr = pins.createBuffer(1)
        addr.setNumber(NumberFormat.Int8LE, 0, UART2_WR_CMD)
        const msg = Buffer.fromUTF8(val)
        const lf = pins.createBuffer(1)
        lf.setNumber(NumberFormat.Int8LE, 0, 10)

        let arr = [addr, msg, lf]
        let buffer = Buffer.concat(arr)

        pins.i2cWriteBuffer(EXT_BOARD_ADDR, buffer, false)
    }
}

//--------------------------------------------------------------------------