odoo.define('ies_credit_note.credit_note', function (require) {
	"use strict";

    var core = require('web.core');
    var gui = require('point_of_sale.gui');
    var Model = require('web.DataModel');
    var models = require('point_of_sale.models');
	var QWeb = core.qweb;
	var _t   = core._t;
    var screens = require('point_of_sale.screens');
    var PopupWidget = require('point_of_sale.popups');

    var PosModelSuper = models.PosModel;

    models.load_fields("account.journal",['is_credit_note']);


    screens.ProductScreenWidget.include({
        return_confirm: function(ref,open_order){
            this._super(ref,open_order);
            var order = this.pos.get_order();
        }

    });

    screens.PaymentScreenWidget.include({

        get_note_number:function(){
            var self = this;
            var number = "8" + Math.random().toString(10).substr(2, 12);
            if (self.pos.db.get_coupon_info(number)){
                self.get_note_number();
            }
            return number;
        },

        generate_credit_note: function(){
            var self = this;
            var done = new $.Deferred();
            var order = this.pos.get_order();
            var has_credit_note = false;
            if (order.pos_mode == 'return'){
                var credit_amount = 0.0;
                _.each(order.paymentlines.models, function(pl){
                    if (pl.cashregister.journal.is_credit_note){
                            credit_amount += pl.amount;
                            has_credit_note = true;
                    }
                });
                var rel_product = self.pos.db.get_product_by_barcode('POSCREDITNOTE');
                if (rel_product === undefined){
                    self.pos.gui.show_popup('ERROR',_t('Please Create product with barcode POSCREDITNOTE.'));
                }
                var credit_note = {
                     'name': self.get_note_number(),
                     'uid': order.uid,
                     'amount': credit_amount,
                     'rem_amount': credit_amount,
                     'type': 'f',
                     'coupon_type':'cn',
                     'state': 's',
                     'sale_date' : moment(new Date()).format("MM/DD/YYYY"),
                     'rel_product_id': [rel_product.id, rel_product.display_name],
                }
                order['credit_note'] = credit_note;
                order['has_credit_note'] = has_credit_note;
                self.pos.db.add_coupons([credit_note]);
            }
            done.resolve();
            return done;
        },

        finalize_validation: function() {
            var self = this;
            self.generate_credit_note().done(function(){
                self._super();
            });
            ;
        },

    });

	var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({

        export_as_JSON: function() {
            var order = _super_order.export_as_JSON.apply(this,arguments);
            var selectedOrder = this.pos.get_order();
            if (selectedOrder && selectedOrder.credit_note){
                order['credit_note'] = selectedOrder.credit_note;
                order['note_number'] = selectedOrder.credit_note.name;
            }
            return order;
        },

        export_for_printing: function(){
            var receipt = _super_order.export_for_printing.apply(this,arguments);
            var barcode_cn_src = false;
            var order = this.pos.get_order();
            if (order.has_credit_note && order.credit_note && order.credit_note.name){
                var note_number = order.credit_note.name;
                var barcodeTemplate = QWeb.render('BarcodeDiv',{
                   widget: self,
                   barcode : note_number
                });
                $(barcodeTemplate).find('#xml_receipt_barcode').barcode(note_number.toString(), "code128");
                if(_.isElement($(barcodeTemplate).find('#xml_receipt_barcode').barcode(note_number.toString(), "code128")[0])){
                    if($(barcodeTemplate).find('#xml_receipt_barcode').barcode(note_number.toString(), "code128")[0].firstChild != undefined
                            && $(barcodeTemplate).find('#xml_receipt_barcode').barcode(note_number.toString(), "code128")[0].firstChild.data != undefined){
                        barcode_cn_src = $(barcodeTemplate).find('#xml_receipt_barcode').barcode(note_number.toString(), "code128")[0].firstChild.data;
                    }
                }
                receipt.barcode_cn_src = barcode_cn_src;
                receipt.barcode_nr = note_number;
            }
            return receipt;
        },


    })


});
