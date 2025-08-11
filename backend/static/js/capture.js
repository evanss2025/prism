let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

let startBtn = document.getElementById('start-camera');
let captureBtn = document.getElementById('capture-photo');

let stream = null;
let colorResult = null;

startBtn.addEventListener('click', async () => {
    console.log("start button clicked");
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 300, height: 200 } 
        });
        
        video.srcObject = stream;
        
        startBtn.disabled = true;
        captureBtn.disabled = false;
        
    } catch (error) {
        console.log(error);
    }
});

captureBtn.addEventListener('click', async () => {
    context.drawImage(video, 0, 0, 300, 200);
    
    canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('image', blob, 'capture.png');
        
        captureBtn.disabled = true;
        captureBtn.textContent = 'Analyzing...';
        
        try {
            const response = await fetch('/analyze-color/green', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                console.log("Color match! Land added");
                colorResult = true;
            } else {
                console.log("No color match, no land added");
                colorResult = false;
            }
            
        } catch (error) {
            console.log(error);
        } finally {
            captureBtn.disabled = false;
            captureBtn.textContent = 'Capture Photo';
        }
        
    }, 'image/png');
});