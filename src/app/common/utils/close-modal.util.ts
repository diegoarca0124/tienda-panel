declare var $: any;

export const closeModal = (id: string) => {
	const modal = $(`#${id}`);

	modal.modal('hide');

	$('body').removeClass('modal-open');
	$('body').css('overflow', '');
	$('body').css('padding-right', '');
	$('.modal-backdrop').remove();
};
