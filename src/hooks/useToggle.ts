import { useState } from 'react'

const useToggle = () => {
 const [isToggled, setIsToggled] = useState<boolean>(false)

 const toggleHandler = () => {
    setIsToggled((prev) => !prev)
 }

  return { isToggled, toggleHandler }
}

export default useToggle
