// Input from Quirky sensors
flux2 <- hardware.pin2;
flux5 <- hardware.pin5;
flux7 <- hardware.pin7;
 
// Configure pins as analog in
flux2.configure(ANALOG_IN);
flux5.configure(ANALOG_IN);
flux7.configure(ANALOG_IN);
 
 
const array_size=20; 

newAvg2<-0;
newAvg5<-0;
newAvg7<-0;

counter<-0;


flux2_data<-[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
flux5_data<-[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
flux7_data<-[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

hitFirst15<-false;


function weigh()
{
	//set up arrays to hold data points within one change (~2- units)
	
	server.log(counter);


    flux2_data[counter] = flux2.read();
    flux5_data[counter] = flux5.read();
    flux7_data[counter] = flux7.read();
    
    
    
    //requires the array to be fully populated   
    if (counter==array_size-1)
    {
      computeMovAvg()
    }

    counter++;
    counter = counter % array_size;
    

    // Restart loop after delay
    imp.wakeup(1, weigh);
    
}

function computeMovAvg()
{

  //server.log("entered computeMovAvg");

  //assume have old average
  //compute new average
  for (local i=0; i<array_size; i++)
  {
    newAvg2=newAvg2+flux2_data[i];
    newAvg5=newAvg5+flux5_data[i];
    newAvg7=newAvg7+flux7_data[i];
    
  }
  newAvg2=newAvg2/array_size;
  newAvg5=newAvg5/array_size;
  newAvg7=newAvg7/array_size;
  
  server.log("new 2  "+newAvg2);
  server.log("new 5  "+newAvg5);
  server.log("new 7  "+newAvg7);
  
  
  local ret2;
  local ret5;
  local ret7;
  local retall;
  
  //calibration
  ret2=newAvg2-33000;
  ret5=newAvg5-33025;
  ret7=newAvg7-35000;
  
  retall=((ret2+ret5+ret7)/7)+300; ///3 for avg /2 for calibration of volume
  if (retall<0)
    retall=0;
  server.log("VOL: "+ retall);
  
  
}
 
// Start the loop
weigh()
