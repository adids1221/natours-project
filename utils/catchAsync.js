module.exports = catchAsync = fn => {
    return (req, res, next) => {
        //catchAsync return an anonymous function that assianged to "Creat Tour"
        //then the fn function get called when we creating a new tour function witht he same argumments
        fn(req, res, next).catch(next);
    };
}