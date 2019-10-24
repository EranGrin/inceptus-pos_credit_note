# -*- coding: utf-8 -*-
# Part of Inceptus ERP Solutions Pvt.ltd.
# See LICENSE file for copyright and licensing details.
{
    'name': "POS Credit Note",
    'summary': """
        POS Credit Note""",
    'description': """
        POS Credit Note
    """,
    'author': "Inceptus.io",
    'website': "http://www.inceptus.io",

    'category': 'POS',
    'version': '0.1',
    'depends': ['ies_pos_return', 'ies_base_redeem', 'ies_base'],
    'data': [
        # 'security/ir.model.access.csv',
        'data/pos_data.xml',
        'views/templates.xml',
        'views/account_views.xml',
        'views/pos_views.xml',
        'views/credit_note_views.xml',

    ],

    'qweb': ['static/src/xml/*.xml'],
    'installable': True,
    'auto_install': False,
    'application': True,
}