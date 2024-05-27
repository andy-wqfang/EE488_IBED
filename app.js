document.getElementById('connectButton').addEventListener('click', connectToDevice);
let log = console.log;
let labels = ["full strike", "lift", "chop", "backhand save"];
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
    const dataDisplay = document.getElementById('dataDisplay');
    dataDisplay.innerHTML = ''; // Clear previous data
    // const p = document.createElement('p');
    // p.textContent = `Received data: ${Array.from(data).join(', ')}`;
    // dataDisplay.appendChild(p);
    data.forEach((value, index) => {
      const p = document.createElement('p');
      p.className = 'data-item';
      p.textContent = `${labels[index]}: ${value}`;
      dataDisplay.appendChild(p);
    });
}
