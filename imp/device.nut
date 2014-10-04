// Input from Quirky sensors
flux1 <- hardware.pin1;
flux2 <- hardware.pin2;
flux3 <- hardware.pin2;
 
// Configure pins as analog in
flux1.configure(ANALOG_IN);
flux2.configure(ANALOG_IN);
flux3.configure(ANALOG_IN);
 
function weigh()
{
    // Read the pin and log its value
    server.log(flux1.read());
 
    // Restart loop after delay
    imp.wakeup(0.1, weigh);
}
 
// Start the loop
weigh()
