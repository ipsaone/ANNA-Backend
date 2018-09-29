# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "bento/debian-8.11-i386"

  config.vm.hostname = "ANNA-BACKEND"
  config.vm.define "ANNA-BACKEND"
  config.vm.provider :virtualbox do |vb|
      vb.name = "ANNA-BACKEND"
      vb.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
  end

  config.trigger.after :up, warn: "---! ANOTHER SHELL SHOULD BE OPENED FOR SSH !---", run: {inline: "vagrant rsync-auto"}
  config.vm.network "private_network", ip: "192.168.50.5"
  config.vm.synced_folder ".", "/vagrant", disabled: true
  config.vm.synced_folder ".", "/home/vagrant/ANNA-Backend", 
    type: "rsync", 
    rsync__args: ["--verbose", "--archive", "--delete", "-z", "--no-links"],
    rsync__exclude: ["node_modules", ".git/", ".vagrant/"]

  config.vm.provision "shell", path: "./vagrant/configure", privileged: false
end
