(function() {
  var Hydra, context, nokia, samsung, webcl;

  nokia = 'Nokia';

  samsung = 'Samsung';

  if (window.WebCL) {
    context = window.WebCL;
    webcl = nokia;
  } else if (window.WebCLComputeContext) {
    context = new window.WebCLComputeContext();
    webcl = samsung;
  } else {
    webcl = null;
  }

  Hydra = (function() {
    var constant, _i, _j, _len, _len2, _ref, _ref2;

    function Hydra() {}

    Hydra.provider = webcl;

    Hydra.supported = webcl !== null;

    if (Hydra.provider === samsung) {
      _ref = window.WebCLComputeContext;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        constant = _ref[_i];
        if (constant !== 'property') {
          Hydra[constant] = window.WebCLComputeContext[constant];
        }
      }
    } else if (Hydra.provider === nokia) {
      _ref2 = window.WebCL;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        constant = _ref2[_j];
        if (constant.slice(0, 3) === 'CL_') {
          Hydra[constant.slice(3)] = window.WebCL[constant];
        }
      }
    }

    return Hydra;

  })();

  this.Hydra = Hydra;

}).call(this);
