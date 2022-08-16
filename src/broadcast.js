export const connectToChannel = () => {
  const bc = new BroadcastChannel('test_channel')
  
  bc.postMessage('This is a test message.')
  
  bc.onmessage = (event) => {
    console.log(event)
  }
  bc.close()
}
