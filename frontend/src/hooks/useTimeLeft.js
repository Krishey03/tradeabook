import { useState, useEffect } from "react"

function useTimeLeft(endTime) {
    const [timeLeft, setTimeLeft] = useState("")

    const calculateTimeLeft = () => {
        const now = new Date()
        const endTimeDate = new Date(endTime)
        const timeDifference = endTimeDate - now

        if (timeDifference <= 0) {
            setTimeLeft("Bidding Ended")
            return
        }

        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000)

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }
    

    useEffect(() => {
        if (endTime) {
            calculateTimeLeft()
            const interval = setInterval(calculateTimeLeft, 1000)

            return () => clearInterval(interval)
        }
    }, [endTime])

    return timeLeft
}

export default useTimeLeft
