document.getElementById('connectButton').addEventListener('click', connectToDevice);
let log = console.log;
let counts = [0,0,0,0];
let labels = ["full strike", "lift", "chop", "backhand save"];
let audios = ["full_strike.mp3","lift.m4a","chop.m4a","backhand_save.m4a"];
// ，yoo
async function connectToDevice() {
    let serviceUuid = "81c30e5c-0000-4f7d-a886-de3e90749161";
    if (serviceUuid.startsWith('0x')) {
      serviceUuid = parseInt(serviceUuid);
    }
  
    // let characteristicUuid = document.querySelector('#characteristic').value;
    let characteristicUuid = "81c30e5c-1001-4f7d-a886-de3e90749161";
    if (characteristicUuid.startsWith('0x')) {
      characteristicUuid = parseInt(characteristicUuid);
    }
  
    log('Requesting Bluetooth Device...');
    navigator.bluetooth.requestDevice({filters: [{services: [serviceUuid]}]})
    .then(device => {
      log('Connecting to GATT Server...');
      return device.gatt.connect();
    })
    .then(server => {
      log('Getting Service...');
      return server.getPrimaryService(serviceUuid);
    })
    .then(service => {
      log('Getting Characteristic...');
      return service.getCharacteristic(characteristicUuid);
    })
    .then(characteristic => {
      
      log('> Characteristic UUID:  ' + characteristic.uuid);
      log('> Broadcast:            ' + characteristic.properties.broadcast);
      log('> Read:                 ' + characteristic.properties.read);
      log('> Write w/o response:   ' +
        characteristic.properties.writeWithoutResponse);
      log('> Write:                ' + characteristic.properties.write);
      log('> Notify:               ' + characteristic.properties.notify);
      log('> Indicate:             ' + characteristic.properties.indicate);
      log('> Signed Write:         ' +
        characteristic.properties.authenticatedSignedWrites);
      log('> Queued Write:         ' + characteristic.properties.reliableWrite);
      log('data:                   ' + characteristic.readValue());
      characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
      characteristic.startNotifications();
      log('> Writable Auxiliaries: ' +
        characteristic.properties.writableAuxiliaries);
    })
    .catch(error => {
      log('Argh! ' + error);
    });
  
    // try {
    //     // Replace with your device's service and characteristic UUIDs
    //     const serviceUuid = '81c30e5c-0000-4f7d-a886-de3e90749161';
    //     const characteristicUuid = '81c30e5c-1001-4f7d-a886-de3e90749161';

    //     console.log('Requesting Bluetooth Device...');
    //     const device = await navigator.bluetooth.requestDevice({
    //         filters: [{ services: [serviceUuid] }]
    //     });
        
    //     console.log('Connecting to GATT Server...');
    //     const server = await device.gatt.connect();

    //     console.log('Getting Service...');
    //     const service = await server.getPrimaryService(serviceUuid);
    //     const services = await server.getPrimaryServices();
    //     console.log('Available Services:', services.map(service => service.uuid));

    //     console.log('Getting Characteristic...');
    //     const characteristic = await service.getCharacteristic(characteristicUuid);
    //     const characteristics = await service.getCharacteristics();
    //     console.log('Available Characteristics:', characteristics.map(characteristic => characteristic.uuid));
        
    //     console.log('Starting Notifications...');
    //     await characteristic.startNotifications();

    //     characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

    //     console.log('Connected to device and started notifications');
    // } catch (error) {
    //     console.error('Error:', error);
    //     if (error.name === 'NotSupportedError') {
    //         alert('GATT Error: Not supported. Please check if the device supports the requested service and characteristic.');
    //     }
    // }
}

function handleCharacteristicValueChanged(event) {
    const value = event.target.value;
    // const data = new TextDecoder().decode(value); // Assuming the data is text
    const data = new Float32Array(value.buffer);
    if (data[0] == -1) {
      return;
    }
    displayData(data);

}

function displayData(data) {
    log('data[0] ' + data[0]);
    log('data[1] ' + data[1]);
    log('data[2] ' + data[2]);
    log('data[3] ' + data[3]);
    const maxIndex = data.indexOf(Math.max(...data));
    drawPossi(data);
    playAudio(maxIndex);
    drawGraph(maxIndex);


    // dataDisplay.innerHTML = ''; // Clear previous data
    // data.forEach((value, index) => {
    //     const p = document.createElement('p');
    //     p.className = 'data-item';
    //     p.textContent = `${labels[index]}: ${value}`;
    //     dataDisplay.appendChild(p);
    // });
    //const ctx = document.getElementById('dataDisplay').getContext('2d');


}
function drawPossi(data){
    var color_arr = ["#abc7c9", "#3f9b97", "#79aeba", "#d5d6d0"];
    var text_arr =  labels;
    const canvas = document.getElementById('canvas');
    //2.获取上下文(当前是2d)
    const ctx = canvas.getContext('2d');

    var radius = canvas.height / 2 - 20; //半径
    var ox = radius + 20, oy = radius + 20; //圆心

    var width = 30, height = 10; //图例宽和高
    var posX = ox * 2 + 20, posY = 30;   //
    var textX = posX + width + 5, textY = posY + 10;

    var startAngle = 0; //起始弧度
    var endAngle = 0;   //结束弧度
    for (var i = 0; i < data.length; i++)
        {
            //绘制饼图
            endAngle = endAngle + data[i] * Math.PI * 2; //结束弧度
            ctx.fillStyle = color_arr[i];
            ctx.beginPath();
            ctx.moveTo(ox, oy); //移动到到圆心
            ctx.arc(ox, oy, radius, startAngle, endAngle, false);
            ctx.closePath();
            ctx.fill();
            startAngle = endAngle; //设置起始弧度

            //绘制比例图及文字
            ctx.fillStyle = color_arr[i];
            ctx.fillRect(posX, posY + 20 * i, width, height);
            ctx.moveTo(posX, posY + 20 * i);

            ctx.fillStyle = color_arr[i]; //"#000000";
            var percent = text_arr[i] ;
            ctx.fillText(percent, textX, textY + 20 * i);
        }
    }
function drawGraph(maxIndex){
    counts[maxIndex]++;
    const drawDisplay = document.getElementById('drawDisplay');
    drawDisplay.innerHTML = '';

// Convert data into format suitable for Chart.js bar chart
    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Counts',
            backgroundColor:  ["#abc7c9", "#3f9b97", "#79aeba", "#d5d6d0"],
            // borderColor: '#79aeba',
            borderWidth: 1,
            data:counts
        }]
    };

// Get the Canvas element
    const canvas = document.createElement('canvas');
    drawDisplay.appendChild(canvas);
    const ctx = canvas.getContext('2d');
// Create the bar chart
    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });

}
function playAudio(maxIndex) {
    let path = "audio/";
    const audio = new Audio(path+audios[maxIndex]);
    // const audio  = new Audio('audio/badminton.wav');
    audio.play();
}
