# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "debian/jessie64"

  config.vm.network "private_network", ip: "192.168.50.5"
  config.vm.synced_folder ".", "/home/vagrant/ANNA-Backend"


  config.vm.provider "virtualbox" do |v|
    v.name = "OneOS"
    v.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
  end

  config.vm.provision "shell", path: "./vagrant/configure", privileged: false
end
