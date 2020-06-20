const HAS_ASYNC_ITERATOR = typeof Symbol !== 'undefined' && Symbol.asyncIterator;
const HAS_ASYNC_AWAIT = typeof Symbol !== 'undefined' && Symbol.asyncIterator;

!HAS_ASYNC_ITERATOR || require('./asyncIterator');
!HAS_ASYNC_AWAIT || require('./asyncAwait');
