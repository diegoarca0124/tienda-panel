declare var $: any;

export const closeModal = (id?: string) => {
	setTimeout(() => {
		$(`#${id}`).modal('hide');
		$('body').removeClass('modal-open').css('overflow', 'auto !important');
		$('.modal-backdrop').remove();
	}, 50); // 300ms es el tiempo típico de animación del modal
};
