# 🚀 Render Quick Setup Steps

## ✅ What You Did (Correct!)

You correctly:
- ✅ Changed environment variables to `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY`
- ✅ Removed `JWT_PRIVATE_KEY_PATH` and `JWT_PUBLIC_KEY_PATH`

## 📋 What You Need to Do Now

### Step 1: Add JWT Keys to Render

Go to Render → Your Service → **Environment** tab.

Add these TWO environment variables with the values below:

---

### Variable 1: `JWT_PRIVATE_KEY`

**Value:**
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCUDCdcR9fias+C
c77IBlsSamKDOYluIf4rB8pGtlzr5SqlwoXTT2NAmAsI3o/Qd++y3JBj3FDTZBZ4
uKgAPZ5kbZikDNWvJ7Pf/s7vH6pmejUN5ZmwKm5mL5q9FJ1MvXwPhQtkMPRsaQqG
mjAOiyWzCCdEJutxSaVosYE/OAv41saQh/jKRwt2EoRAJ/XYCmrkgGvSrjmSvIEt
Sm1XfuPfFU7YGfN340kO57ySxOWFI1NdFsVzJeZe7mzNRb8VUbU8H86gSffre+G0
HyQJayYJHQ5+Q3ZG3uxRLQkAqtfuzt6oUj9ChBLSXtIWGoVyT8zyuDTBWAVOIZw9
vNnPZiQzAgMBAAECggEARoCBMANwjfzyg/utw2CvdxYdgsNgLIfYm9JSZBlNJ/NS
u2xmwYoBSI3/V0Jxt0OebQ13X27YOMrlnqjFLJQrfUTp11nbWtWr5cRY9GwegD27
TTplVYznVRdfd6K9BAIKdfOUSKq9g3EEV7ROpWZjVh5QYLauEZ2SPUimtZ3xqZaY
XNNWJuCKByYnXP6wMdVS2xC+2KFD21cwTQbRxPzrUmDbRtiGC9I1irweW04DKng3
t/MO5Xhet2MTGzj94RQKgHkisNQo2cEgMftYRXUPihHkw2pnRFxJdlHqyC6iaRyw
nDx5jkmKW1GbAuukkS6JJ3Of9guE5mz+bdwOwxd3EQKBgQDPjpBEakoPHnbRkLDk
kFpMEc+qP+AA1OCIAO5h6zhfvphwsHbtCIfCe3J1Xb3WHYKOmoCfGKFTIHhaqeHm
2dE0PrnuVXjT4lGeaTo1aHcVeiP7ogit1ii88/ohNNDxv08ZIxoQjeDt2/Qyowr8
70PbusVH/pEtIxHPFxFZAWKPIwKBgQC2me2KreIIW4cOU/0rtnwfVBDMII3mnKeX
FZ7xXm6VW7JuALE+yt0tdoz8svz93y+36Mit5dEd0ju6zWnQufiFHqeGSPsVXKwS
8gOrX3Ttk8nXFto6ckxlqy+0oa6gG8ND3KzasS7lQP7AXtkfBwrjurvFZSChf4Ve
8RQB/JtvsQKBgFkbc4RrvW/QPGKsI8V808dkvirxUVIKEntRKwaO3Zz9TqTSnbwV
tXMhXHpWzHFoKezfF+k1wczWW9VQqdNaIB61700LFNyihTflJUBYoQdvcJNPdTps
fwDgHbqz2iBvaZ35G++PecmkbKpwpP8CGbfz706BVAJ00+h8ls4HcjDRAoGBAKtx
+StVOb25GiRkzXcmfoH3r1HJWxJkkaH0heiATnnjv7My6ThYxrQx9AwrjghbbnVR
lmJYPjCuvLAWv7xfcCyk7IvTqBOVkGa1XqagGKwcL83IwhtQR9TJlyAVEl130626
23z2EV7k2IwMQfW06g+Ju1WKLsoTbkkHN07qO5LxAoGAEQKgLnjGbA7+j4vDNmem
5tQdZayjgn5eTu7WxKqn6yg6Wnui4dLFFZqBUe6b51ZI/araNtGRbNvwBxlnXi/W
CQdxF2Z/XIwceOWOpRjjgzJIhhqW5q9uw33izcuMVu4v0rQCANH69EA0mZFhcg/h
yhG8kJA7h7anXgM9wPpYa7o=
-----END PRIVATE KEY-----
```

---

### Variable 2: `JWT_PUBLIC_KEY`

**Value:**
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlAwnXEfX4mrPgnO+yAZb
EmpigzmJbiH+KwfKRrZc6+UqpcKF009jQJgLCN6P0HfvstyQY9xQ02QWeLioAD2e
ZG2YpAzVryez3/7O7x+qZno1DeWZsCpuZi+avRSdTL18D4ULZDD0bGkKhpowDosl
swgnRCbrcUmlaLGBPzgL+NbGkIf4ykcLdhKEQCf12Apq5IBr0q45kryBLUptV37j
3xVO2Bnzd+NJDue8ksTlhSNTXRbFcyXmXu5szUW/FVG1PB/OoEn363vhtB8kCWsm
CR0OfkN2Rt7sUS0JAKrX7s7eqFI/QoQS0l7SFhqFck/M8rg0wVgFTiGcPbzZz2Yk
MwIDAQAB
-----END PUBLIC KEY-----
```

---

## ⚠️ IMPORTANT Notes

1. **Copy the ENTIRE key** including `-----BEGIN` and `-----END` lines
2. **Preserve all line breaks** - Render should handle this automatically
3. **Don't add quotes** around the values
4. **Make sure both variables are set** before deploying

---

## ✅ After Adding the Keys

1. Save the environment variables in Render
2. Deploy/Redeploy your service
3. Check the logs to ensure no errors about missing keys
4. Test the `/health` endpoint

---

## 🐛 If You Still See Errors

If you still see `Error: ENOENT: no such file or directory, open './keys/jwt_private.pem'`:

1. Double-check that both `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` are set
2. Verify the keys include the `-----BEGIN` and `-----END` lines
3. Check Render logs for any warnings about key format

---

That's it! The code is already configured to read from these environment variables. 🚀

Thanks, Guga! 🙏
