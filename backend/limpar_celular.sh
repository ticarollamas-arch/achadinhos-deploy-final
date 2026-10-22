#!/bin/bash

echo "🧹 Iniciando a limpeza profunda (Mantendo WhatsApp, Insta e Bancos)..."

# 1. Pacotes do Facebook (Consome MUITA RAM)
rish -c "pm uninstall --user 0 com.facebook.katana"
rish -c "pm uninstall --user 0 com.facebook.appmanager"
rish -c "pm uninstall --user 0 com.facebook.services"
rish -c "pm uninstall --user 0 com.facebook.system"
rish -c "pm uninstall --user 0 com.facebook.stella"

# 2. Bloatware da Samsung (Bixby, Samsung Pay, Temas, etc)
rish -c "pm uninstall --user 0 com.samsung.android.bixby.agent"
rish -c "pm uninstall --user 0 com.samsung.android.bixby.wakeup"
rish -c "pm uninstall --user 0 com.samsung.android.app.spage"
rish -c "pm uninstall --user 0 com.samsung.android.spay"
rish -c "pm uninstall --user 0 com.samsung.shop"
rish -c "pm uninstall --user 0 com.samsung.android.themestore"
rish -c "pm uninstall --user 0 com.samsung.android.app.tips"
rish -c "pm uninstall --user 0 com.samsung.android.voc"
rish -c "pm uninstall --user 0 com.samsung.android.scloud"
rish -c "pm uninstall --user 0 com.samsung.android.smartswitchassistant"
rish -c "pm uninstall --user 0 com.sec.android.easyMover"
rish -c "pm uninstall --user 0 com.samsung.android.aremoji"
rish -c "pm uninstall --user 0 com.samsung.android.game.gametools"
rish -c "pm uninstall --user 0 com.samsung.android.game.gos"

# 3. Google e Amazon que você não usa
rish -c "pm uninstall --user 0 com.google.android.apps.tachyon" # Meet
rish -c "pm uninstall --user 0 com.google.android.videos"       # Play Filmes
rish -c "pm uninstall --user 0 com.google.android.apps.youtube.music" # YT Music
rish -c "pm uninstall --user 0 com.amazon.mShop.android.shopping" # Amazon
rish -c "pm uninstall --user 0 com.amazon.mp3.galaxy"             # Amazon Music

# 4. Outros lixos pesados (TikTok, CapCut, Kwai, etc)
rish -c "pm uninstall --user 0 com.zhiliaoapp.musically" # TikTok
rish -c "pm uninstall --user 0 com.kwai.video"           # Kwai
rish -c "com.lemon.lvoverseas"                           # CapCut
rish -c "pm uninstall --user 0 com.shopee.shopeeseller"  # Shopee Seller
rish -c "pm uninstall --user 0 com.sankuai.sailor.afooddelivery" # iFood
rish -c "pm uninstall --user 0 com.taxis99"              # 99 Taxi
rish -c "pm uninstall --user 0 com.jio.myjio"            # Lixo de operadora
rish -c "pm uninstall --user 0 com.paxum"
rish -c "pm uninstall --user 0 com.uairango"
rish -c "pm uninstall --user 0 com.agnes.pixa"
rish -c "pm uninstall --user 0 com.rsupport.rs.activity.rsupport.aas2"
rish -c "pm uninstall --user 0 com.hiya.star"
rish -c "pm uninstall --user 0 com.mygalaxy.service"
rish -c "pm uninstall --user 0 com.ezt.pdfreader.pdfviewer"
rish -c "pm uninstall --user 0 com.rarlab.rar"           # WinRAR (se usar, pule esta linha)
rish -c "pm uninstall --user 0 com.anu.developers3k.rootchecker" # Root Checker

echo "✅ Limpeza concluída! Rode 'free -h' para ver a RAM livre."
