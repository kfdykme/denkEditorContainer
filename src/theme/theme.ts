


const initTheme = () => {
    const isDarkMode = localStorage.getItem("isDarkMode") === "true"

    if (isDarkMode) {
        document.body.className = 'darkTheme'    
    } else {
        document.body.className = 'lightTheme'
    }

    const fakeWindow = window as any
    fakeWindow.toggleDarkMode = () => {
        const isDarkMode = (localStorage.getItem("isDarkMode") === "true")

        localStorage.setItem('isDarkMode', !isDarkMode + "")
        if (isDarkMode) {
            document.body.className = 'darkTheme'    
        } else {
            document.body.className = 'lightTheme'
        }
    }
}

export default initTheme