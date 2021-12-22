let labels;
let model;

async function start() {
    // 加载名称
    labels = $.ajax({
        url: "model/class_names.txt",
        async: false
    }).responseText.split('\n');

    // 模型
    model = await tf.loadLayersModel('model/model.json');
    model.summary();
    // const pred = model.predict(tf.zeros([1, 28, 28, 1]))
    // console.log(pred.dataSync())
}

// 初始化
start()

function preprocess(imgData) {
    return tf.tidy(() => {
        let tensor = tf.browser.fromPixels(imgData, numChannels = 1)
        const resized = tf.image.resizeBilinear(tensor, [28, 28]).toFloat()
        const normalized = tf.fill([28, 28, 1], 255).sub(resized).div(tf.scalar(255))
        const batched = normalized.expandDims(0)
        return batched
    })
}

var canvas = $('#drawArea');
var isPressed = false;
var cxt = canvas[0].getContext("2d");
r = 2//画笔大小
cxt.lineWidth = r

// 画笔
canvas.mousedown(function (e) {
    isPressed = true;
    var positionX = Math.abs(e.pageX - canvas.offset().left); //获取当前鼠标相对img的X坐标
    var positionY = Math.abs(e.pageY - canvas.offset().top); //获取当前鼠标相对img的Y坐标
    if (positionX >= r && positionX <= canvas.width() - r && positionY >= r && positionY <= canvas.height() - r) {
        cxt.beginPath();
        cxt.moveTo(positionX,positionY)
    }
});

// 移动画笔
canvas.mousemove(function (e) {
    if (isPressed) {
        var positionX = Math.abs(e.pageX - canvas.offset().left); //获取当前鼠标相对img的X坐标
        var positionY = Math.abs(e.pageY - canvas.offset().top); //获取当前鼠标相对img的Y坐标
        if (positionX >= r && positionX <= canvas.width() - r && positionY >= r && positionY <= canvas.height() - r) {
            cxt.lineTo(positionX,positionY);
            cxt.stroke();
        }
    }
});

// 停止画笔
canvas.mouseup(function () {
    cxt.closePath();

    isPressed = false;

    const imgData = cxt.getImageData(0, 0, 600, 600);
    const pred = model.predict(preprocess(imgData)).dataSync()

    var display = '您画的可能是: '

    for(var i = 0; i < pred.length; i++){
        if(pred[i] > 0.5){
            display += labels[i] + ', '
        }
    }

    if(display == '您画的可能是: '){
        display = '我也猜不出您画的是什么'
    }
    console.log(display);
    $('#result').html(display);
});



function eraseCanvas() {
    cxt.fillStyle = "#FFFFFF";
    cxt.fillRect(0, 0, 600, 600);
    $('#result').html('');
}

$('#eraseBtn').click(function () {
    eraseCanvas();
});
