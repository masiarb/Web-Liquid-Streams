#include <node.h>

// C standard library
#define BCM2708_PERI_BASE        0x20000000
#define GPIO_BASE                (BCM2708_PERI_BASE + 0x200000) /* GPIO controller */


#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <dirent.h>
#include <fcntl.h>
#include <assert.h>
#include <unistd.h>
#include <sys/mman.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/time.h>
#include "bcm2835.h"
#include <unistd.h>

#define MAXTIMINGS 100




using namespace v8;
using namespace std;


// This function returns a JavaScript stringifyed json with temperature and humidity.
Handle<Value> readDHT(const Arguments& args) {

    HandleScope scope;

   // check if i am root, to access gpio, and initialize it.

   if(geteuid() != 0){
        ThrowException(Exception::Error(String::New("you must be the root to access GPIO")));
	return scope.Close(Undefined());
   }

   if(!bcm2835_init()) {
	ThrowException(Exception::Error(String::New("Gpio not initialized")));
	return scope.Close(Undefined());

   }

    int data[100];
    int counter = 0;
    int lastState = HIGH;
    int j = 0;

    bcm2835_gpio_fsel(17, BCM2835_GPIO_FSEL_OUTP);
    bcm2835_gpio_write(17, HIGH);
    usleep(500000);  // 500 ms
    bcm2835_gpio_write(17, LOW);
    bcm2835_gpio_fsel(17, BCM2835_GPIO_FSEL_INPT);

    data[0] = data[1] = data[2] = data[3] = data[4] = 0;

    while (bcm2835_gpio_lev(17) == 1) {
    usleep(1);
  }
    for(int i = 0; i < MAXTIMINGS; i++){
        counter = 0;
        while(bcm2835_gpio_lev(17) == lastState){
           counter++;
           if(counter == 1000) break;
        }

    lastState = bcm2835_gpio_lev(17);
    if (counter == 1000) break;
    if((i>3) && (i%2 == 0)){
     data[j/8] <<= 1 ;
     if (counter > 200){
        data[j/8] |= 1;
     }  
     j++;
  }
 }
    if ((j >= 39) && (data[4] == ((data[0] + data[1] + data[2] + data[3]) & 0xFF)) ) {
        float f, h;
        h = data[0] * 256 + data[1];
        h /= 10;

        f = (data[2] & 0x7f) * 256 + data[3];
        f /= 10.0;
        if ( data[2] & 0x80) f *= -1;
        
        
        
       // char result[31];
     //   sprintf(result, "{ 'temp': %.1f, 'hum' : %.1f }", f, h);
        
        Handle<Object> result = Object::New();
        result->Set(String::New("temperature"), Number::New(f));
        result->Set(String::New("humidity"), Number::New(h));
    
        return scope.Close(result);
        
       // tempJson << "{ 'temp': " << f << ", 'hum': " << h << "}";
        //return scope.Close(tempJson.str());
}
    
    
    return scope.Close(
                          Integer::New(1)
                       );
}

void RegisterModule(Handle<Object> target) {
    srand(time(NULL));
        target->Set(String::NewSymbol("readDHT"),
                FunctionTemplate::New(readDHT)->GetFunction());
}

NODE_MODULE(DHTReader, RegisterModule);


