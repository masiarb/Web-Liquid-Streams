/**
 * @file    overcpu.cpp
 * @brief   NodeJS porting of Overseer about CPU performance monitoring and OS scheduling
 * @version 0.3a
 * @author	Achille Peternier (C) 2013 achille.peternier@gmail.com
 */



//////////////
// #INCLUDE //
//////////////
#include <v8.h>
#include <node.h>
#include <iostream>
#include <string>
//#include <linux/unistd.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <thread>
#include <mutex>

//using namespace node;
using namespace v8;



/////////////
// #DEFINE //
/////////////

   // General:
   #define MOD_NAME "OverCpu for Node.js v0.3a"

   // Limits:
   #define MOD_MAXNUMBEROFCHARS  256
   #define MOD_MAXBUFFERSIZE     MOD_MAXNUMBEROFCHARS

   // Logging:
   //#define _DEBUG
   #ifdef _DEBUG
      #define MOD_LOG(x) std::cout << x << std::endl
   #else
      #define MOD_LOG(x)
   #endif

   // OS files:
   #define MOD_PROCSTAT "/proc/stat"

   // Default timer (in ms):
   #define MOD_TIMERMS 1000

   // Sync methods:
   #define MOD_SYNC(x)             std::lock_guard<std::recursive_mutex> lock(x)             ///< Synchronizing access via mutex
   #define MOD_SYNC_BEGIN(x)       do { std::lock_guard<std::recursive_mutex> lock(x)
   #define MOD_SYNC_END(x)         } while(0)

   // /proc/stat categories of jiffies:
   enum MOD_PROCSTATCATEGORY
   {
      MOD_JIFFY_STDPROCUSERMODE = 0,
      MOD_JIFFY_NICEPROCUSERMODE,
      MOD_JIFFY_SYSTPROCKERNMODE,
      MOD_JIFFY_IDLE,
      MOD_JIFFY_IOWAIT,
      MOD_JIFFY_IRQ,
      MOD_JIFFY_SOFTIRQ,
      MOD_JIFFY_STEALTIME,
      MOD_JIFFY_VIRTUALGUEST,
      MOD_JIFFY_UNKNOWN,
      MOD_JIFFY_LAST,
   };



///////////////////
// CLASS OverCpu //
///////////////////
class OverCpu : node::ObjectWrap
{
///////////
private: //
///////////

   // Instance counter, don't touch!
   int m_count;

   // Process data:
   int pid;
   char filename[MOD_MAXNUMBEROFCHARS];

   // Stats:
   unsigned long long jiffies, totJiffies, relTotJiffies;
   float cpuUsage, relCpuUsage;

   // Update thread stuff:
   std::thread *thread;
   std::recursive_mutex mutex;	      ///< Mutex for safe MT access
   bool running;
   int sleepTime;


//////////
public: //
//////////

   // Persistent template:
   static v8::Persistent<FunctionTemplate> persFuncTemp;



   ///////////////////
   // C++-only part //
   ///////////////////

   /**
    * Constructor.
    */
   OverCpu() : m_count(0),
                jiffies(0),
                totJiffies(0),
                relTotJiffies(0),
                cpuUsage(0.0f),
                relCpuUsage(0.0f),
                thread(nullptr),
                running(false),
                sleepTime(MOD_TIMERMS)
   {
      pid = (int) syscall(__NR_gettid);
      sprintf(filename, "/proc/%d/stat", pid);

      // First update explicit to reset data:
      updateStats();

      // Start a thread for regular updates:
      thread = new std::thread(updateThread, this);
   }

   /**
    * Destructor.
    */
   ~OverCpu()
   {
      MOD_LOG("[-] Destructor invoked");

      // Shutdown thread:
      MOD_SYNC_BEGIN(mutex);
         running = false;
      MOD_SYNC_END(mutex);

      thread->join();
      delete thread;
   }

   /**
    * Update usage statistics.
    */
   bool updateStats()
   {
      MOD_SYNC(mutex);

	   // Baseline reference on /proc/stat:
      int refDat = open(MOD_PROCSTAT, O_RDONLY | O_NONBLOCK, 0);
      char refBuffer[MOD_MAXBUFFERSIZE];
      int refNumRead = read(refDat, refBuffer, MOD_MAXBUFFERSIZE-1);
      close(refDat);
      refBuffer[refNumRead] = '\0';

      // Current process data on /proc/pid#/stat:
      char pidBuffer[MOD_MAXBUFFERSIZE];
		int pidDat = open(filename, O_RDONLY | O_NONBLOCK, 0);
		if (pidDat == -1)
		{
		   MOD_LOG("ERROR: unable to open file for stat updating");
		   return false;
		}
      int numRead = read(pidDat, pidBuffer, MOD_MAXBUFFERSIZE-1);
	   if (numRead == -1)
	   {
	      MOD_LOG("ERROR: unable to read from pid file");
	      return false;
	   }
	   close(pidDat);
	   pidBuffer[numRead] = '\0';


      /////////////////
      // Scan ref file:
      unsigned long long cat[MOD_JIFFY_LAST];
      sscanf(refBuffer, "%*s %llu %llu %llu %llu %llu %llu %llu %llu %llu %llu", &cat[MOD_JIFFY_STDPROCUSERMODE],
                                                                   &cat[MOD_JIFFY_NICEPROCUSERMODE],
                                                                   &cat[MOD_JIFFY_SYSTPROCKERNMODE],
                                                                   &cat[MOD_JIFFY_IDLE],
                                                                   &cat[MOD_JIFFY_IOWAIT],
                                                                   &cat[MOD_JIFFY_IRQ],
                                                                   &cat[MOD_JIFFY_SOFTIRQ],
                                                                   &cat[MOD_JIFFY_STEALTIME],
                                                                   &cat[MOD_JIFFY_VIRTUALGUEST],
                                                                   &cat[MOD_JIFFY_UNKNOWN]);

      // Update absolute reference values:
      unsigned long long prevTotJiffies = totJiffies;
      totJiffies = 0;
      for (int c=0; c<MOD_JIFFY_LAST; c++)
         totJiffies += cat[c];
      unsigned long long delta = totJiffies - prevTotJiffies;

      // Update relative reference values:
      unsigned long long prevRelTotJiffies = relTotJiffies;
      relTotJiffies = totJiffies - cat[MOD_JIFFY_IDLE] - cat[MOD_JIFFY_IOWAIT];
      unsigned long long relDelta = relTotJiffies - prevRelTotJiffies;


      //////////////////////////////
      // Compute per-process values:
      unsigned long long prevJiffies = jiffies;
      unsigned long long pidUserModeTime, pidKernModeTime, pidUserModeWait, pidKernModeWait;
      sscanf(pidBuffer, "%*d %*s %*c %*d %*d %*d %*d %*d %*u %*u %*u %*u %*u %llu %llu %llu %llu", &pidUserModeTime, &pidKernModeTime, &pidUserModeWait, &pidKernModeWait);
      jiffies = pidUserModeTime + pidKernModeTime; // + pidUserModeWait + pidKernModeWait;

      // Compute stats:
      unsigned long long pidDelta = jiffies - prevJiffies;
      if (delta == 0)
      {
         cpuUsage = 0.0f;
         relCpuUsage = 0.0f;
      }
      else
      {
         cpuUsage = (float) (((double) pidDelta / (double) delta) * 100.0);
         relCpuUsage = (float) (((double) pidDelta / (double) relDelta) * 100.0);
      }
      // if (cpuUsage > 100.0f) cpuUsage = 100.0f;
      // if (relCpuUsage > 100.0f) relCpuUsage = 100.0f;

      // Done:
      return true;
   }

   /**
    * Update thread, started by the constructor.
    * @param class pointer
    */
   static void *updateThread(OverCpu *_this)
   {
      _this->running = true;

      // Start loop:
      while (true)
      {

         // Update values:
         bool _running;
         int _sleepTime;
         MOD_SYNC_BEGIN(_this->mutex);
            _running = _this->running;
            _sleepTime = _this->sleepTime;
            _this->updateStats();
         MOD_SYNC_END(_this->mutex);

         // Still running?
         if (!_running)
         {
             MOD_LOG("[-] Thread quiet shutdown");
             return nullptr;
         }

         // Wait till next update:
         usleep(_sleepTime * 1000);
      }
   }


   ////////////////////
   // NodeJS wrapper //
   ////////////////////

   /**
    * Class initializer invoked by the extern "C" hereafter.
    * @param target boh!
    */
   static void init(Handle<Object> target)
   {
      HandleScope scope;
      Local<FunctionTemplate> t = FunctionTemplate::New(New);
      persFuncTemp = Persistent<FunctionTemplate>::New(t);
      persFuncTemp->InstanceTemplate()->SetInternalFieldCount(1);
      persFuncTemp->SetClassName(String::NewSymbol("OverCpu"));
      NODE_SET_PROTOTYPE_METHOD(persFuncTemp, "getPid", getPid);
      NODE_SET_PROTOTYPE_METHOD(persFuncTemp, "getCpuUsage", getCpuUsage);
      NODE_SET_PROTOTYPE_METHOD(persFuncTemp, "getRelCpuUsage", getRelCpuUsage);
      NODE_SET_PROTOTYPE_METHOD(persFuncTemp, "setUpdateInterval", setUpdateInterval);
      target->Set(String::NewSymbol("OverCpu"), persFuncTemp->GetFunction());
   }

   /**
    * Fake constructor invoked by NodeJS.
    * @param args instance wrapper
    */
   static Handle<Value> New(const Arguments& args)
   {
      HandleScope scope;
      OverCpu* overcpu = new OverCpu();
      overcpu->Wrap(args.This());
      return args.This();
   }

   /**
    * Get current process id.
    * @param args instance wrapper
    * @todo maybe remove it, since already available in nodejs api
    */
   static Handle<Value> getPid(const Arguments& args)
   {
      HandleScope scope;

      // Get pid:
      pid_t pid = (pid_t) syscall(__NR_gettid);

      // Return value:
      Local<Integer> result = Integer::New(pid);
      return scope.Close(result);
   }

   /**
    * Get process cpu usage.
    * @param args instance wrapper
    */
   static Handle<Value> getCpuUsage(const Arguments& args)
   {
      HandleScope scope;
      OverCpu* overcpu = ObjectWrap::Unwrap<OverCpu>(args.This());

      // Return value:
      MOD_SYNC(overcpu->mutex);
      Local<Number> result = Number::New(overcpu->cpuUsage);
      return scope.Close(result);
   }

   /**
    * Get process relative cpu usage.
    * @param args instance wrapper
    */
   static Handle<Value> getRelCpuUsage(const Arguments& args)
   {
      HandleScope scope;
      OverCpu* overcpu = ObjectWrap::Unwrap<OverCpu>(args.This());

      // Return value:
      MOD_SYNC(overcpu->mutex);
      Local<Number> result = Number::New(overcpu->relCpuUsage);
      return scope.Close(result);
   }

   /**
    * Set update time.
    * @param args instance wrapper
    */
   static Handle<Value> setUpdateInterval(const Arguments& args)
   {
      HandleScope scope;
      OverCpu* overcpu = ObjectWrap::Unwrap<OverCpu>(args.This());

       // Acquire params:
      if (args.Length() != 1)
         return ThrowException(Exception::TypeError(String::New("This method takes 1 arg: update interval (in ms)")));

      // Get interface number :
      int updateInterval = args[0]->ToInt32()->Int32Value();
      if (updateInterval < 0)
         return ThrowException(Exception::TypeError(String::New("Invalid interval number")));

      // Return value:
      MOD_SYNC(overcpu->mutex);
      overcpu->sleepTime = updateInterval;
      return scope.Close(Boolean::New(true));
   }
};



////////////
// STATIC //
////////////

   // Persistent function template:
   Persistent<FunctionTemplate> OverCpu::persFuncTemp;



/////////////
// METHODS //
/////////////

extern "C"
{
   /**
    * Entry-point for NodeJS
    * @param Handle handle for initialization
    */
   static void init (Handle<Object> target)
   {
      OverCpu::init(target);
   }
   NODE_MODULE(overcpu, init);
}



