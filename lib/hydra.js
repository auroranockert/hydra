(function() {
  var Context, Hydra, Nokia, Platform, Samsung, WebCL;

  Nokia = 'Nokia';

  Samsung = 'Samsung';

  if (window.WebCL) {
    Context = window.WebCL;
    WebCL = Nokia;
  } else if (window.WebCLComputeContext) {
    Context = new window.WebCLComputeContext();
    WebCL = Samsung;
  } else {
    WebCL = null;
  }

  Hydra = (function() {

    function Hydra() {}

    Hydra.provider = WebCL;

    Hydra.supported = WebCL !== null;

    if (Hydra.provider === Samsung) {
      for (constant in window.WebCLComputeContext) {
			if (constant != 'property') {
				Hydra[constant] = window.WebCLComputeContext[constant]
			}
		};
    } else if (Hydra.provider === Nokia) {
      for (constant in window.WebCL) {
			if (constant.substring(0, 3) == "CL_") {
				Hydra[constant.substring(3)] = window.WebCLComputeContext[constant]
			}
		};
    }

    if (Context !== null) {
      Hydra.getPlatformIDs = function() {
        var i, platforms, result, _ref;
        result = [];
        platforms = Context.getPlatformIDs();
        for (i = 0, _ref = platforms.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
          result[i] = new Platform(platforms[i]);
        }
        return result;
      };
    } else {
      Hydra.getPlatformIDs = function() {
        return [];
      };
    }

    return Hydra;

  })();

  Platform = (function() {

    function Platform(platform) {
      this.platform = platform;
    }

    Platform.prototype.getPlatformInfo = function(info) {
      return this.platform.getPlatformInfo(info);
    };

    Platform.prototype.getDeviceIDs = function(type) {
      return this.platform.getDeviceIDs(type);
    };

    return Platform;

  })();

  this.Hydra = Hydra;

}).call(this);
