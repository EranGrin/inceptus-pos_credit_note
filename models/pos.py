# -*- coding: utf-8 -*-

from odoo import models, fields, api
import random
from random import randrange


class ProductCoupon(models.Model):
    _inherit = 'product.coupon'



class PosOrder(models.Model):
    _name = "pos.order"

    _inherit = ["pos.order", "ies.base"]

    is_credit_note = fields.Boolean('Credit Note?')
    is_redeemed = fields.Boolean('Is Reedemed?')
    # note_number = fields.Char('Credit Note')
    credit_note_id = fields.Many2one('product.coupon', 'Related Credit Note')

    @api.multi
    def generate_credit_note(self, order):
        coupon_env = self.env['product.coupon']
        product_id = self.env.ref('ies_credit_note.ies_credit_note_product_product_template')
        vals = {
            'name': order.get('name'),
            'amount': order.get('amount'),
            'rem_amount': order.get('amount'),
            'product_id': product_id.id,
            'type': product_id.discount_type,
            'sale_price': order.get('amount'),
            'coupon_type': 'cn',
            'sale_date': order.get('sale_date') and order.get('sale_date').split(' ')[0],
            'state': 's',
        }
        credit_note_rec = coupon_env.create(vals)
        return credit_note_rec

    @api.model
    def _order_fields(self, ui_order):
        res = super(PosOrder, self)._order_fields(ui_order)
        if ui_order.get('credit_note'):
            credit_note_rec = self.generate_credit_note(ui_order.get('credit_note'))
            res.update(credit_note_id=credit_note_rec.id)
        return res
