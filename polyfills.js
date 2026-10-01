// Полифилл для :focus-visible
if (!('focusin' in document)) {
    document.addEventListener('focusin', function(e) {
        if (e.target !== this && e.target.closest('*')) {
            const relatedTarget = e.relatedTarget;
            if (!relatedTarget || !relatedTarget.isSameNode(e.target) && document.activeElement !== relatedTarget) {
                e.target.dispatchEvent(new Event('focusin', { bubbles: true }));
            }
        }
    });
}

// Полифилл для :focus-visible
if (!('focus-visible' in document.documentElement.style)) {
    document.documentElement.classList.add('focus-visible-polyfilled');
    document.addEventListener('focusin', function(e) {
        if (e.target !== document.activeElement) {
            e.target.classList.add('focus-visible');
        }
    });
    document.addEventListener('focusout', function(e) {
        e.target.classList.remove('focus-visible');
    });
    document.addEventListener('blur', function(e) {
        e.target.classList.remove('focus-visible');
    });
}

// Убираем класс focus-visible, если элемент не фокусируется
const focusableElements = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
focusableElements.forEach(el => {
    el.addEventListener('blur', () => {
        el.classList.remove('focus-visible');
    });
});