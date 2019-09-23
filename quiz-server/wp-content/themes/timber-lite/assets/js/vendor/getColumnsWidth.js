//http://stackoverflow.com/questions/8354786/determine-the-width-of-a-dynamic-css3-multicolumn-div-width-fixed-column-width
(function($){
    $.fn.extend({
        getColumnsWidth: function() {

                // append an empty <span>
                $this = $(this).append('<span></span>');

                // grab left position
                var pos = $this.find('span:last-of-type').position().left;

                // get prefix for css3
                var prefix;
                if (jQuery.browser.webkit) prefix = '-webkit-';
                else if (jQuery.browser.opera) prefix = '-o-';
                else if (jQuery.browser.mozilla) prefix = '-moz-';
                else if (jQuery.browser.msie) prefix = '-ms-';

                // add the width of the final column
                pos += parseInt($this.css(prefix + 'column-width'), 10);

                // subtract one column gap (not sure why this is necessary?)
                pos -= parseInt($this.css(prefix + 'column-gap'),10);

                // remove empty <span>
                $(this).find('span:last-of-type').remove();

                // return position
                return pos;

        }
    });
})(jQuery);