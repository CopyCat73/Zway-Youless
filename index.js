/*** Youless Z-Way module *******************************************

Version: 1.00
(c) CopyCatz, 2015
-----------------------------------------------------------------------------
Author: CopyCatz <copycat73@outlook.com>
Description: Display Youless pulse counter data

******************************************************************************/

function Youless (id, controller) {
    // Call superconstructor first (AutomationModule)
    Youless.super_.call(this, id, controller);
    
    this.datatimer          = undefined;

}

inherits(Youless, AutomationModule);

_module = Youless;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------

Youless.prototype.init = function (config) {
    Youless.super_.prototype.init.call(this, config);

    var self = this;
    self.langFile = self.controller.loadModuleLang("Youless");
    var devicename = self.config.youless_name.toString();

    this.vDev = this.controller.devices.create({
        deviceId: "Youless_" + this.id,
        defaults: {
            metrics : {
                level: 0
            }
        },
        overlay: {
            deviceType: "sensorMultilevel",
            metrics : {
                probeTitle: self.langFile.title,
                icon: '/ZAutomation/api/v1/load/modulemedia/Youless/icon.png',
                scaleTitle: 'Watt',
                title: devicename
            }
        }
    });
       
    var intervalTime    = parseInt(self.config.interval) * 60 * 1000;
    
    self.datatimer = setInterval(function() {
        self.fetchYoulessData();
    }, intervalTime);
    
    self.fetchYoulessData();
    
};
    


Youless.prototype.stop = function () {
    
    var self = this;
    
    if (self.vDev) {
        self.controller.devices.remove(self.vDev.id);
        self.vDev = undefined;
    }
    
    if (self.datatimer) {
        clearInterval(self.datatimer);
        self.datatimer = undefined;
    }
    
    Youless.super_.prototype.stop.call(this);
 
};

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------

Youless.prototype.fetchYoulessData = function () {
    
    var self = this;
    var currentDate = new Date();

    console.log("[Youless] Update");
    var url = this.config.youless_url+"/a?f=j";
    
    http.request({
        url: url,
        async: true,
        success: function(response) {
            var value = response.data.pwr;
            self.vDev.set('metrics:level',value);
            self.vDev.set('metrics:timestamp',currentDate.getTime());     
        },
        error: function(response) {
            console.error("[Youless] Data fetch error");
            console.logJS(response);
            self.controller.addNotification(
                "error", 
                self.langFile.err_fetch_data, 
                "module", 
                "Youless"
            );
        }
    });
};


