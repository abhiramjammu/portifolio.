import json, urllib.request
data = json.loads(urllib.request.urlopen('https://api.github.com/users/abhiramjammu/repos').read())
for r in data:
    print(f"{r['name']}: {r['homepage']} (URL: {r['html_url']})")
