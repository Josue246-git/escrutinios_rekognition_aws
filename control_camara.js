const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const guardarFotoBtn = document.getElementById('guardarFoto');
const reiniciarBtn = document.getElementById('reiniciar');
const avisos = document.getElementById('avisos');

// Acceder a la cámara
navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((err) => {
        console.error("Error al acceder a la cámara: " + err);
        avisos.textContent = "Error al acceder a la cámara.";
    });

// Capturar la imagen
document.getElementById('tomarFoto').addEventListener('click', () => {
    // Ajustar el tamaño del canvas al de A4
    canvas.width = 500; // Ancho A4
    canvas.height = 650; // Alto A4
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height); // Congelar la imagen
    video.style.display = 'none'; // Ocultar el video
    canvas.style.display = 'block'; // Mostrar el canvas con la imagen
    guardarFotoBtn.style.display = 'inline-block'; // Mostrar el botón para guardar
    reiniciarBtn.style.display = 'inline-block'; // Mostrar el botón para reiniciar
});

// Guardar la imagen como archivo
guardarFotoBtn.addEventListener('click', () => {
    const imagen = canvas.toDataURL('image/png');
    const enlace = document.createElement('a');
    enlace.href = imagen;
    enlace.download = 'captura.png'; // Nombre del archivo
    enlace.click();
    avisos.textContent = "Fotografía guardada correctamente.";
});

// Reiniciar la captura
reiniciarBtn.addEventListener('click', () => {
    video.style.display = 'block'; // Mostrar el video nuevamente
    canvas.style.display = 'none'; // Ocultar el canvas
    guardarFotoBtn.style.display = 'none'; // Ocultar el botón para guardar
    reiniciarBtn.style.display = 'none'; // Ocultar el botón para reiniciar
    avisos.textContent = "Listo para tomar otra fotografía.";
});
 