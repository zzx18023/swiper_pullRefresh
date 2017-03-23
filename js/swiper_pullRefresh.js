(function(Swiper) {
	function SwiperRefresh(container, params) {

		if(params && (params.up || params.down)) {
			//覆写配置属性以适应下拉刷新
			params.direction = 'vertical';
			params.slidesPerView = 'auto';
			params.freeMode = true;

			//生成Swiper
			var mySwiper = new Swiper(container, params);
			if(params.down) {
				//下拉刷新DOM
				params.down.callback = typeof params.down.callback == 'function' ? params.down.callback : function() {}

				mySwiper.topPocket = mySwiper.$('<div class="swiper-pull-top-pocket"><div class="swiper-pull"><div class="swiper-pull-icon"></div><div class="swiper-pull-caption">下拉可以刷新</div></div></div>');
				mySwiper.container.prepend(mySwiper.topPocket);

				mySwiper.endPulldownToRefresh = function() { //下拉刷新结束
					mySwiper.params.slidesOffsetBefore = 0;
					mySwiper.update();
					mySwiper.setWrapperTransition(this.params.speed);
					mySwiper.setWrapperTranslate(0);
					mySwiper.topPocket.removeClass('loading');
					mySwiper.topPocket.css('visibility', 'hidden');
					mySwiper.loading = false;
				};

			};

			if(params.up) {
				params.up.callback = typeof params.up.callback == 'function' ? params.up.callback : function() {}

				//上拉加载DOM
				mySwiper.bottomPocket = mySwiper.$('<div class="swiper-pull-bottom-pocket"><div class="swiper-pull"><div class="swiper-pull-icon"></div><div class="swiper-pull-caption">上拉加载更多</div></div></div>');
				mySwiper.slides.append(mySwiper.bottomPocket);
				mySwiper.upPull = false;

				mySwiper.endPullupToRefresh = function(t) { //上拉加载结束
					mySwiper.update();
					mySwiper.bottomPocket.removeClass('loading');
					if(t) {
						mySwiper.bottomPocket.find('.swiper-pull-caption').html('没有更多数据了');
						mySwiper.bottomPocket.find('.swiper-pull-icon').css('display', 'none');
						mySwiper.upPull = true;
					} else {
						mySwiper.bottomPocket.find('.swiper-pull-caption').html('上拉加载更多');
					}
					mySwiper.loading = false;
				};
				mySwiper.refresh = function() { //重新启用上拉加载
					mySwiper.upPull = false;
					mySwiper.bottomPocket.find('.swiper-pull-icon').css('display', '');
					mySwiper.bottomPocket.find('.swiper-pull-caption').html('上拉加载更多');
				};
//				mySwiper.up = function() {
//					console.log(this);
//
//				};

			};

			mySwiper.update();
			mySwiper.loading = false; //正在刷新或加载

			function SliderMoveFn(swiper) {
				if(!swiper.loading) {
					if(swiper.translate > 0 && params.down) {
						swiper.topPocket.css('visibility', 'visible');
						if(swiper.translate >= swiper.topPocket.height()) {
							swiper.topPocket.find('.swiper-pull-icon').css('transform', 'rotateZ(0deg)');
							swiper.topPocket.find('.swiper-pull-caption').html('释放立即刷新');
						} else {
							swiper.topPocket.find('.swiper-pull-icon').css('transform', 'rotateZ(-180deg)');
							swiper.topPocket.find('.swiper-pull-caption').html('下拉可以刷新');
						};
					} else if(!mySwiper.upPull && params.up) {
						var dp = swiper.translate + (swiper.slides.height() - swiper.wrapper.height() > 0 ? swiper.slides.height() - swiper.wrapper.height() : 0)
						if(dp < -10) {
							swiper.bottomPocket.find('.swiper-pull-icon').css('transform', 'rotateZ(-180deg)');
							swiper.bottomPocket.find('.swiper-pull-caption').html('释放立即加载');
						} else if(dp < 0) {
							swiper.bottomPocket.find('.swiper-pull-icon').css('transform', 'rotateZ(0deg)');
							swiper.bottomPocket.find('.swiper-pull-caption').html('上拉加载更多');
						};

					};
				};
			};
			mySwiper.on('SliderMove', SliderMoveFn);

			function TouchEndFn(swiper) {
				if(!swiper.loading) {
					if(swiper.translate > 0 && params.down) {
						if(swiper.translate >= swiper.topPocket.height()) {
							swiper.loading = true;
							swiper.topPocket.find('.swiper-pull-icon').css('transform', 'rotateZ(-180deg)');
							swiper.topPocket.find('.swiper-pull-caption').html('正在刷新...');
							swiper.topPocket.addClass('loading');
							swiper.params.slidesOffsetBefore = swiper.topPocket.height();
							swiper.updateSlidesSize();
							swiper.params.down.callback(swiper);
						} else {
							swiper.topPocket.css('visibility', 'hidden');
						};
					} else if(!mySwiper.upPull && params.up) {
						if(params.down) {
							swiper.topPocket.css('visibility', 'hidden');
						};

						var dp = swiper.translate + (swiper.slides.height() - swiper.wrapper.height() > 0 ? swiper.slides.height() - swiper.wrapper.height() : 0)
						if(dp <= -10) {
							swiper.loading = true;
							swiper.bottomPocket.find('.swiper-pull-icon').css('transform', 'rotateZ(0deg)');
							swiper.bottomPocket.find('.swiper-pull-caption').html('正在加载...');
							swiper.bottomPocket.addClass('loading');
							swiper.params.up.callback(swiper);

						};

					};
				};
			};
			mySwiper.on('TouchEnd', TouchEndFn);

			if(params.down && params.down.auto) { //第一次自动执行下拉
				mySwiper.topPocket.css('visibility', 'visible');
				mySwiper.setWrapperTransition(mySwiper.params.speed);
				mySwiper.setWrapperTranslate(mySwiper.topPocket.height());
				TouchEndFn(mySwiper);
			} else if(params.up && params.up.auto) {
				mySwiper.setWrapperTransition(mySwiper.params.speed);
				mySwiper.setWrapperTranslate((mySwiper.wrapper.height() - mySwiper.slides.height() < 0 ? mySwiper.wrapper.height() - mySwiper.slides.height() : 0) - 10);
				TouchEndFn(mySwiper);
				mySwiper.setWrapperTranslate(0);
			};
			return mySwiper;
		};
	};
	window.SwiperRefresh = window.SwiperRefresh || SwiperRefresh;
})(Swiper);