"use strict";

module.exports = function endlessly(run) {
    function waitForIt() {
    	run(function repeat(reason) {
            console.log("... not yet [" + reason + "] (waiting 2s)");
            // try in 2s
            setTimeout(waitForIt, 2000);
    	});
    }
    waitForIt();
};