function constructThreshold() {
  const step = 0.01;
  let x = 0;
  const thresholds = [];
  while (x < 1) {
    x += step;
    thresholds.push(x);
  }

  return thresholds;
}

function calculateRootMargin(index) {
  return (parseInt(index, 10) + 1) * 20 + 12;
}

function calculateScale(index, intersectionRatio) {
  const lowerBound = 0.85 + index * 0.05;
  const scale = 1 - (1 - lowerBound) * (1 - intersectionRatio);
  return scale.toFixed(2);
}

let global_isBottomMostCardIntersecting = false;

function fixCardsAtTop(index, entries, _observer) {
  entries.forEach((entry) => {
    const { intersectionRatio, target } = entry;
    const cardInner = target.querySelector(".card-inner");
    const topPosition = target.getBoundingClientRect().top;

    if (topPosition <= calculateRootMargin(index)) {
      if (intersectionRatio > 0 && !global_isBottomMostCardIntersecting) {
        cardInner.classList.add("fixed");
        cardInner.style.top = `${(parseInt(index, 10) + 1) * 20}px`;
      }
      const styleStr = `scale(${calculateScale(index, intersectionRatio)})`;
      cardInner.style.transform = styleStr;
    } else {
      cardInner.classList.remove("fixed");
      cardInner.style.top = 0;
      cardInner.style.transform = "unset";
    }
  });
}

function moveCardsWithTransformedStyle(index, entries, _observer, cards) {
  entries.forEach((entry) => {
    const { target } = entry;
    const topPosition = target.getBoundingClientRect().top;

    if (topPosition <= calculateRootMargin(index)) {
      global_isBottomMostCardIntersecting = true;
      cards.forEach((card, index) => {
        if (index === cards.length - 1) {
          return;
        }
        const cardInner = card.querySelector(".card-inner");
        cardInner.classList.add("abs");
        cardInner.style.top = "unset";
        cardInner.style.bottom = `${
          (cards.length - parseInt(index, 10)) * 20
        }px`;
      });
    } else {
      global_isBottomMostCardIntersecting = false;
      cards.forEach((card, index) => {
        if (index === cards.length - 1) {
          return;
        }
        const cardInner = card.querySelector(".card-inner");
        cardInner.classList.remove("abs");
        cardInner.style.bottom = "unset";
        cardInner.style.top = `${(parseInt(index, 10) + 1) * 20}px`;
      });
    }
  });
}

function attachIntersectionObserver() {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card, index) => {
    const rootMargin = -calculateRootMargin(index);

    const options = {
      root: null,
      rootMargin: `${rootMargin}px 0px 0px 0px`,
      threshold: constructThreshold(),
    };

    const observer = new IntersectionObserver((entries, observer) => {
      index === cards.length - 1
        ? moveCardsWithTransformedStyle(index, entries, observer, cards)
        : fixCardsAtTop(index, entries, observer);
    }, options);

    observer.observe(card);
  });
}

window.onload = attachIntersectionObserver;
