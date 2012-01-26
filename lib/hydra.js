(function() {
  var CL, Context, Device, Hydra, Nokia, Platform, Provider, Samsung;

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

    Hydra.createContext = function(devices) {
      switch (Hydra.provider) {
        case Samsung:
          if (devices.length === 1 && devices[0].index === 0) {
            return new Context(CL.createContext(null, devices[0].devices, null, null));
          } else {
            throw "Not implemented yet";
          }
          break;
        case Nokia:
          throw "Not implemented yet";
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

    return Context;

  })();

  this.Hydra = Hydra;

}).call(this);
