/*
    Quick & Dirty Production Demo - CardConnect's Hosted iFrame Tokenizer
    Ash Craig, FirmPOS Software

    Demonstrates how a card number gets tokenized so you can perform sales or auths
    from manual keyed card numbers.

    No warranties. Just sample code. Use at your risk. Use as you like. Hope it helps.

    @uses:  Bootstrap
    jQuery
    Font Awesome 4
*/

var DATA_TYPE;
var TOKEN_PROPERTY;

var cardServices = {
    init : function(){
        var self = this;

        //show the initial loading msg
        self.working(true, 'Loading...');

        //initially hide the error handling rows
        $(".cd-err-row").hide();

        //hide the token display element
        $("#myToken").hide();

        //add the listener for messages from the frame
        window.addEventListener('message', function(event) {
            var token;
            var mytoken;

            //reset the token value
            $("#myToken").text("");
            $("#myToken").hide();

            //create the token response from the data
            token = self.parse(event.data);

            //check for errors
            if (token.validationError != undefined) {

                //remove focus from other elements
                $("#tokenframe").focus();

                //show the error msg
                $("#cc_error").show();

                //remove the msg after about 3 seconds
                setTimeout(function(){
                    $("#cc_error").fadeOut();
                },3400);

                //there's an issue... let the user know
                //we also use this as a cover while the hosted iFrame
                //loads and gets styled in the background
                self.working(true, 'Issue...');

                //reload the iframe
                self.setFrame();
                return false;
            }

            //evaluate the token against for validity
            $("#myToken").text(token[TOKEN_PROPERTY]);
            $("#myToken").fadeIn();

        }, false);

        //this creates the frame
        self.setFrame();

        //sets the global handling for
        //proper token validation
        TOKEN_PROPERTY = self.scrubInput(self.getQueryVariable("tokenpropname", "message"), 30, "message", /^[0-9a-zA-Z]+$/);

        //simple example of ajax call to pass token
        //exp date and cvvc to server
        $("#btn_submit").off("click").on("click", function(){
            self.submitButton();
        });
    },
    ajax : function(data, url, success){
        var self = this;

        $.ajax({
            type: "POST",
            url: url,
            data: data,
            dataType: DATA_TYPE,
            timeout: function(){
                alert("Timeout");
            },
            success: function(data){

                success(data);
            }
        })
    },
    getQueryVariable : function(variable, defaultValue){
        var self = this;
        var query = window.location.search.substring(1);
        var vars = query.split("&");

        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) {
                return pair[1];
            }
        }
        return defaultValue ? defaultValue : (false);
    },
    isNumeric : function(n){
        var self = this;
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    parse : function(data){
        var self = this;

        return JSON.parse(data);
    },
    scrubInput : function(input, maxlen, fallback, pattern){
        var self = this;

        if (input && input.length !== 0 && input.length <= maxlen) {
            if(input.match(pattern)){
                return input;
            }
        }
        return fallback;
    },
    setFrame : function(){
        var self = this;

        //style the frame to match your form
        var style = '&css=input:focus{outline: none;}body{margin:0!important;}';
        style = style + 'input{margin: 0px; padding: 12px 10px; font-size: 15px;';
        style = style + 'font-family: arial; background-color: whitesmoke; border: none; width: 1000px;}';

        //create the querystr parameters to pass to the frame
        var opts = '?invalidinputevent=true';
        opts = opts + '&enhancedresponse=true';
        opts = opts + '&formatinput=true';
        opts = opts + style;

        //the complete url for the frame
        var url = 'https://fts.cardconnect.com:6443/itoke/ajax-tokenizer.html' + opts;

        //load the frame
        $("#tokenframe").attr("src", url);

        //keep the working element visible for another 300ms
        //as the frame finishes loading styles
        //you can adjust this time if it's not enough
        setTimeout(function(){
            self.working(false);
        },300);
    },
    submitButton : function(){
        var self = this;
        var token = $.trim($("#myToken").text());
        var exp = $.trim($("#exp").val());
        var cvvc = $.trim($("#cvvc").val());

        //simple check for sample data (you will want to do more validation)
        if ( token == '' || exp == '' || cvvc == '') {
            alert("Please enter valid card data before submitting.")
            return false;
        }

        //pass the card info with token to simpulate add
        //you will want to have a customer profile created
        //or info to create one as you submit this data
        var parm = {
            "token" : token,
            "exp" : exp,
            "cvvc" : cvvc
        }

        //call sample response in PHP file
        //but you can use whatever works for you
        var data_url =  "service/";

        //show the working modal
        self.working(true, "Adding Card...");

        //do the ajax call
        self.ajax(parm, data_url, function(data){

            self.working(false);

            //if successful, the returned status will equal "success"
            if (data.status == "success") {

                //complete the task and display the completion msg
                $("#card_container").html($("#template_card_completed").html());

                //remove unnecessary items
                $("#myToken").remove();
                $("#btn_submit").remove();

            } else {

                //on error, you should display a mag from the server
                alert(data.msg);
            }
        });
    },
    working : function(toggle, msg=''){
        var self = this;

        if (msg == '') {
            msg='working...';
        }

        if (toggle == true) {
            $("#_working")
            .text(msg)
            .show();
        } else {
            $("#_working").fadeOut();
        }
    }
}

$(function(){
    cardServices.init();
});

DATA_TYPE = "json";
