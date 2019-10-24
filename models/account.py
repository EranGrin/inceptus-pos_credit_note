# -*- coding: utf-8 -*-
# Part of Inceptus ERP Solutions Pvt.ltd.
# See LICENSE file for copyright and licensing details.

from odoo import api, fields, models, _


class AccountJournal(models.Model):
    _inherit = 'account.journal'

    is_credit_note = fields.Boolean('Credit Note?')
    allow_return = fields.Boolean('Allow in Return?')
