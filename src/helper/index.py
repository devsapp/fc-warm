# coding=utf-8

import requests
import os
import fc2

fc_client_timeout = 3


def build_fc_client(fc_context):
    credentials = fc_context.credentials

    region_id = fc_context.region
    account_id = fc_context.account_id
    access_key_id = credentials.accessKeyId
    access_key_secret = credentials.accessKeySecret
    sts_token = credentials.securityToken

    endpoint = "https://{0}.{1}.fc.aliyuncs.com".format(account_id, region_id)

    if sts_token:
        return fc2.Client(endpoint=endpoint,
                          accessKeyID=access_key_id,
                          accessKeySecret=access_key_secret,
                          securityToken=sts_token,
                          Timeout=fc_client_timeout)
    return fc2.Client(
        endpoint=endpoint,
        accessKeyID=access_key_id,
        accessKeySecret=access_key_secret,
        Timeout=fc_client_timeout)


def handler(event, context):
    if os.environ.get('KEEP_WARM_FC_URL') is not None:
        url = os.environ['KEEP_WARM_FC_URL']
        method = os.environ['KEEP_WARM_FC_METHOD'] or 'head'
        res = requests.request(method, url)
        print(res.status_code)
    else:
        client = build_fc_client(context)
        client.invoke_function(context.service.name, os.environ['FUNCTION_NAME'],
                                        payload='{"action":"heartbeat"}')
        print(200)
