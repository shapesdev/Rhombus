
function drawCanvas() {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
}

onmousemove = (e) => {
    if(e.x < 500 && e.y < 500) {
        console.log("mous location:", e.x, e.y)
    }
}

