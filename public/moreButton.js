$(document).ready(function() {
    $('.collapse').on('show.bs.collapse', function() {
        $('.more-button span').html('Hide');
    });
    $('.collapse').on('hide.bs.collapse', function() {
        $('.more-button span').html('Show');
    });
});
