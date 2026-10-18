# Reelgood

Reelgood is a responsive watchlist website that can also be installed as a phone app. The same app works in a desktop or mobile browser, and its app shell and saved watchlist remain available offline after the first visit. Movie posters and web fonts need an internet connection until they have loaded once.

## Run the website

Serve this folder with any static web server and open its address in a browser. For example, if Python is installed:

```powershell
py -m http.server 8000
```

Then open `http://localhost:8000`.

## Install on a phone

Publish the files in this folder to any static host with HTTPS, then open the website on your phone:

- **iPhone or iPad:** Open the website in Safari, tap **Share**, then **Add to Home Screen**.
- **Android:** Open the website in your browser, then choose **Install app** or **Add to Home screen** from the browser menu.

The **Install app** button in Reelgood will open the browser's install prompt when available or show the steps for your device. Service workers and installation require HTTPS, except when running on `localhost`.

Your watchlist is saved in the browser on each device. It does not automatically sync between devices.
