(function() {
  var Buffer, CL, CommandQueue, Context, Device, Hydra, Kernel, Nokia, Platform, Program, Provider, Samsung;

  Nokia = 'Nokia';

  Samsung = 'Samsung';

  if (window.WebCL) {
    CL = window.WebCL;
    Provider = Nokia;
  } else if (window.WebCLComputeContext) {
    CL = new window.WebCLComputeContext();
    Provider = Samsung;
  } else {
    Provider = null;
  }

  Hydra = (function() {
    var constant;

    function Hydra() {}

    Hydra.provider = Provider;

    Hydra.supported = Provider !== null;

    if (Hydra.provider === Samsung) {
      for (constant in window.WebCLComputeContext) {
        if (constant !== 'property') {
          Hydra[constant] = window.WebCLComputeContext[constant];
        }
      }
    } else if (Hydra.provider === Nokia) {
      for (constant in window.WebCL) {
        if (constant.substring(0, 3) === "CL_") {
          Hydra[constant.substring(3)] = window.WebCL[constant];
        }
      }
    }

    if (CL !== null) {
      Hydra.getPlatformIDs = function() {
        var i, platforms, result, _ref;
        if (!this.provider) return [];
        result = [];
        platforms = CL.getPlatformIDs();
        for (i = 0, _ref = platforms.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
          result[i] = new Platform(platforms, i);
        }
        return result;
      };
    } else {
      Hydra.getPlatformIDs = function() {
        return [];
      };
    }

    Hydra.createContext = function(platform, devices) {
      var device;
      switch (Hydra.provider) {
        case Samsung:
          if (devices.length === 1 && devices[0].index === 0) {
            return new Context(CL.createContext(null, devices[0].devices, null, null));
          } else {
            throw "Not implemented yet";
          }
          break;
        case Nokia:
          return new Context(CL.createContext([WebCL.CL_CONTEXT_PLATFORM, platform.id], (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = devices.length; _i < _len; _i++) {
              device = devices[_i];
              _results.push(device.id);
            }
            return _results;
          })()));
      }
    };

    return Hydra;

  })();

  Platform = (function() {

    function Platform(platforms, index) {
      this.platforms = platforms;
      this.index = index;
      this.id = this.platforms[this.index];
    }

    Platform.prototype.getPlatformInfo = function(info) {
      return this.id.getPlatformInfo(info);
    };

    Platform.prototype.getDeviceIDs = function(type) {
      var device, devices, i, result, _i, _len, _ref;
      if (Hydra.provider === Nokia) {
        if (type === Hydra.DEVICE_TYPE_GPU) {
          result = [];
          devices = this.getDeviceIDs(Hydra.DEVICE_TYPE_ALL);
          for (_i = 0, _len = devices.length; _i < _len; _i++) {
            device = devices[_i];
            if (device.getDeviceInfo(Hydra.DEVICE_TYPE) === Hydra.DEVICE_TYPE_GPU) {
              result.push(device);
            }
          }
          return result;
        }
      }
      if (Hydra.provider === Samsung) {
        if (type === Hydra.DEVICE_TYPE_ALL) {
          return this.getDeviceIDs(Hydra.DEVICE_TYPE_CPU).concat(this.getDeviceIDs(Hydra.DEVICE_TYPE_GPU));
        }
      }
      result = [];
      devices = this.id.getDeviceIDs(type);
      for (i = 0, _ref = devices.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        result[i] = new Device(devices, i);
      }
      return result;
    };

    return Platform;

  })();

  Device = (function() {

    function Device(devices, index) {
      this.devices = devices;
      this.index = index;
      this.id = this.devices[this.index];
    }

    Device.prototype.getDeviceInfo = function(info) {
      return this.id.getDeviceInfo(info);
    };

    return Device;

  })();

  Context = (function() {

    function Context(context) {
      this.id = context;
    }

    Context.prototype.getContextInfo = function(info) {
      var devices, i, result, results, _len;
      results = this.id.getContextInfo(info);
      if (info === Hydra.CONTEXT_DEVICES) {
        devices = [];
        for (i = 0, _len = results.length; i < _len; i++) {
          result = results[i];
          devices[i] = new Device(result);
        }
        return devices;
      } else {
        return results;
      }
    };

    Context.prototype.createCommandQueue = function(device, properties) {
      return new CommandQueue(this.id.createCommandQueue(device.id, properties));
    };

    Context.prototype.createBuffer = function(flags, size) {
      return new Buffer(this.id.createBuffer(flags, size, null));
    };

    Context.prototype.createProgramWithSource = function(source) {
      return new Program(this.id.createProgramWithSource(source));
    };

    return Context;

  })();

  CommandQueue = (function() {

    function CommandQueue(queue) {
      this.id = queue;
    }

    CommandQueue.prototype.enqueueWriteBuffer = function(buffer, blocking, offset, size, hostPtr) {
      switch (Hydra.provider) {
        case Samsung:
          return this.id.enqueueWriteBuffer(buffer.id, blocking, offset, size, hostPtr, 0);
        case Nokia:
          return this.id.enqueueWriteBuffer(buffer.id, blocking, offset, size, hostPtr, []);
      }
    };

    CommandQueue.prototype.enqueueReadBuffer = function(buffer, blocking, offset, size, hostPtr) {
      switch (Hydra.provider) {
        case Samsung:
          return this.id.enqueueReadBuffer(buffer.id, blocking, offset, size, hostPtr, 0);
        case Nokia:
          return this.id.enqueueReadBuffer(buffer.id, blocking, offset, size, hostPtr, []);
      }
    };

    CommandQueue.prototype.enqueueNDRangeKernel = function(kernel, globalWorkSize, localWorkSize) {
      switch (Hydra.provider) {
        case Samsung:
          return this.id.enqueueNDRangeKernel(kernel.id, globalWorkSize.length, null, new Int32Array(globalWorkSize), new Int32Array(localWorkSize), 0);
        case Nokia:
          return this.id.enqueueNDRangeKernel(kernel.id, globalWorkSize.length, [], globalWorkSize, localWorkSize, []);
      }
    };

    return CommandQueue;

  })();

  Buffer = (function() {

    function Buffer(buffer) {
      this.id = buffer;
    }

    return Buffer;

  })();

  Program = (function() {

    function Program(program) {
      this.id = program;
    }

    Program.prototype.buildProgram = function(devices) {
      var device;
      switch (Hydra.provider) {
        case Samsung:
          return this.id.buildProgram(null, null, null);
        case Nokia:
          return this.id.buildProgram((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = devices.length; _i < _len; _i++) {
              device = devices[_i];
              _results.push(device.id);
            }
            return _results;
          })(), "");
      }
    };

    Program.prototype.createKernel = function(name) {
      return new Kernel(this.id.createKernel(name));
    };

    return Program;

  })();

  Kernel = (function() {

    function Kernel(kernel) {
      this.id = kernel;
    }

    Kernel.prototype.setKernelArg = function(i, value, type) {
      return this.id.setKernelArg(i, value, type);
    };

    Kernel.prototype.setKernelArgGlobal = function(i, value) {
      switch (Hydra.provider) {
        case Samsung:
          return this.id.setKernelArgGlobal(i, value.id);
        case Nokia:
          return this.id.setKernelArg(i, value.id);
      }
    };

    return Kernel;

  })();

  this.Hydra = Hydra;

}).call(this);
